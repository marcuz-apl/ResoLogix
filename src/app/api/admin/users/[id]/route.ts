import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import db from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { action } = await req.json();

    if (action === 'toggle_admin') {
      const user = db.prepare('SELECT is_admin, is_superadmin FROM users WHERE id = ?').get(resolvedParams.id) as any;
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      
      if (user.is_superadmin && !(session.user as any).isSuperAdmin) {
        return NextResponse.json({ error: "Only SuperAdmins can modify a SuperAdmin's role" }, { status: 403 });
      }

      const newStatus = user.is_admin === 1 ? 0 : 1;
      db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(newStatus, resolvedParams.id);
      return NextResponse.json({ success: true, is_admin: newStatus });
    }

    if (action === 'toggle_superadmin') {
      if (!(session.user as any).isSuperAdmin) {
        return NextResponse.json({ error: "Forbidden: SuperAdmins only" }, { status: 403 });
      }
      const user = db.prepare('SELECT is_superadmin FROM users WHERE id = ?').get(resolvedParams.id) as any;
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      
      const newStatus = user.is_superadmin === 1 ? 0 : 1;
      db.prepare('UPDATE users SET is_superadmin = ? WHERE id = ?').run(newStatus, resolvedParams.id);
      return NextResponse.json({ success: true, is_superadmin: newStatus });
    }

    if (action === 'reset_password') {
      const rawPassword = crypto.randomBytes(8).toString('hex');
      const passwordHash = await bcrypt.hash(rawPassword, 10);
      db.prepare('UPDATE users SET password_hash = ?, needs_password_change = 1 WHERE id = ?').run(passwordHash, resolvedParams.id);
      
      // In production, we should email the new password. For local/demo, we return it to the admin panel.
      return NextResponse.json({ success: true, tempPassword: rawPassword });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err: any) {
    console.error("Admin Update User error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden: Only SuperAdmins can delete users" }, { status: 403 });
    }
    
    const resolvedParams = await params;
    // Don't let the admin delete themselves
    if ((session.user as any).id === resolvedParams.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(resolvedParams.id);
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Admin Delete User error:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
