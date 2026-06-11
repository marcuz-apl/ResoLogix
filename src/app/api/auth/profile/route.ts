import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, currentPassword, newPassword } = await req.json();
    const userId = (session.user as any).id;

    // We can update name without password, but if they want to update password, we need both passwords
    if (name !== undefined) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, userId);
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password.' }, { status: 400 });
      }

      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any;
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
      }

      const hash = await bcrypt.hash(newPassword, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
