import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import db from '@/lib/db-dca';
import { generateHumanId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const scenarios = db.prepare(`
      SELECT id, scenario_name, description, created_at, updated_at 
      FROM dca_scenarios 
      WHERE user_id = ? 
      ORDER BY updated_at DESC
    `).all(userId);

    return NextResponse.json(scenarios);
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

    const { scenario_name, description, params, q_limit, historical_data } = body;

    const id = generateHumanId('dca');

    db.prepare(`
      INSERT INTO dca_scenarios (
        id, user_id, scenario_name, description, 
        qi, di, b, q_limit, historical_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId, scenario_name, description || '',
      params.qi, params.di, params.b, q_limit, 
      JSON.stringify(historical_data)
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('DCA POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
