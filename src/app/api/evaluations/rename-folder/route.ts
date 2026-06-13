import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { oldName, newName } = await req.json();

    if (!oldName || !newName || !newName.trim()) {
      return NextResponse.json({ error: "Both oldName and newName are required" }, { status: 400 });
    }

    if (oldName === 'Example Scenarios') {
      return NextResponse.json({ error: "Cannot rename the Example Scenarios folder" }, { status: 403 });
    }

    const trimmedNew = newName.trim();

    // Rename folder for all evaluations owned by this user
    const isSuperAdmin = (session.user as any).isSuperAdmin === 1 || (session.user as any).isSuperAdmin === true;

    if (isSuperAdmin) {
      db.prepare(
        'UPDATE evaluations SET folder = ?, updated_at = CURRENT_TIMESTAMP WHERE folder = ?'
      ).run(trimmedNew, oldName);
    } else {
      db.prepare(
        'UPDATE evaluations SET folder = ?, updated_at = CURRENT_TIMESTAMP WHERE folder = ? AND user_id = ?'
      ).run(trimmedNew, oldName, userId);
    }

    return NextResponse.json({ success: true, folder: trimmedNew });
  } catch (error: any) {
    console.error('Error renaming folder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
