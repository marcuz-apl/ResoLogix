import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

const getPrimaryKey = (table: string) => {
  if (table === 'risk_factors') return 'evaluation_id';
  return 'id'; // default for users, evaluations, parameters
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, table, data, id } = await req.json();

    // Whitelist tables to prevent arbitrary SQLite injection
    const allowedTables = ['users', 'evaluations', 'parameters', 'risk_factors', 'dca-scenarios'];
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    const pk = getPrimaryKey(table);

    if (action === 'SELECT') {
      const rows = db.prepare(`SELECT * FROM "${table}" ORDER BY ${pk} DESC LIMIT 50`).all();
      return NextResponse.json({ rows });
    }

    if (action === 'UPDATE') {
      if (!id || !data || Object.keys(data).length === 0) {
        return NextResponse.json({ error: 'Missing id or data for UPDATE' }, { status: 400 });
      }

      // Do not allow updating the primary key itself
      const fields = Object.keys(data).filter(k => k !== pk);
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const values = fields.map(f => data[f]);
      
      const stmt = db.prepare(`UPDATE "${table}" SET ${setClause} WHERE ${pk} = ?`);
      const info = stmt.run(...values, id);
      
      return NextResponse.json({ success: true, changes: info.changes });
    }

    if (action === 'DELETE') {
      if (!id) return NextResponse.json({ error: 'Missing id for DELETE' }, { status: 400 });
      
      const stmt = db.prepare(`DELETE FROM "${table}" WHERE ${pk} = ?`);
      const info = stmt.run(id);
      
      return NextResponse.json({ success: true, changes: info.changes });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
