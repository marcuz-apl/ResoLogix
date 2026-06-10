import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user and clear the flag
    db.prepare(`
      UPDATE users SET password_hash = ?, needs_password_change = 0 WHERE id = ?
    `).run(passwordHash, userId);

    return NextResponse.json({ message: "Password updated successfully" });

  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
