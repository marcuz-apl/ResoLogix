import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import db from '@/lib/db';
import { generateHumanId } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // We fetch the full dataset so the client can load it entirely
    const scenarios = db.prepare(`
      SELECT id, scenario_name, folder, description, qi, di, b, q_limit, historical_data, created_at, updated_at 
      FROM "dca-scenarios" 
      WHERE user_id = ? 
      ORDER BY updated_at DESC
    `).all(userId);

    // Parse historical_data JSON strings back to objects
    const parsedScenarios = scenarios.map((s: any) => ({
      ...s,
      historical_data: s.historical_data ? JSON.parse(s.historical_data) : [],
      params: { qi: s.qi, di: s.di, b: s.b }
    }));

    return NextResponse.json(parsedScenarios);
  } catch (error: any) {
    console.error('DCA GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await request.json();

    const { scenario_name, folder, description, params, q_limit, historical_data } = body;
    let { id } = body;

    if (!id) {
      id = generateHumanId('dca');
    }

    db.prepare(`
      INSERT INTO "dca-scenarios" (
        id, user_id, scenario_name, folder, description, 
        qi, di, b, q_limit, historical_data, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        scenario_name = excluded.scenario_name,
        folder = excluded.folder,
        description = excluded.description,
        qi = excluded.qi,
        di = excluded.di,
        b = excluded.b,
        q_limit = excluded.q_limit,
        historical_data = excluded.historical_data,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      id, userId, scenario_name, folder || 'Uncategorized', description || '',
      params.qi, params.di, params.b, q_limit, 
      JSON.stringify(historical_data)
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('DCA POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 });
    }

    db.prepare('DELETE FROM "dca-scenarios" WHERE id = ? AND user_id = ?').run(id, userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DCA DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
