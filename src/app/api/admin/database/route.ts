import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // ONLY SuperAdmins can execute raw SQL
    if (!session || !(session.user as any).isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: SuperAdmins only for raw SQL' }, { status: 403 });
    }

    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query format' }, { status: 400 });
    }

    const upperQuery = query.trim().toUpperCase();

    if (upperQuery.startsWith('SELECT') || upperQuery.startsWith('PRAGMA')) {
      const rows = db.prepare(query).all();
      return NextResponse.json({ result: rows, isSelect: true });
    } else {
      const info = db.prepare(query).run();
      return NextResponse.json({ result: info, isSelect: false });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Both Admins and SuperAdmins can list tables
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    return NextResponse.json({ tables });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
