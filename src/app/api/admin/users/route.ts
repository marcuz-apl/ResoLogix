import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import db from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const users = db.prepare(`
      SELECT id, email, is_admin, needs_password_change, created_at 
      FROM users 
      ORDER BY created_at DESC
    `).all();

    return NextResponse.json(users);

  } catch (err: any) {
    console.error("Admin Fetch Users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
