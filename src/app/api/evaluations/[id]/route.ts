import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const info = db.prepare('DELETE FROM evaluations WHERE id = ?').run(id);
    
    if (info.changes === 0) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Evaluation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting evaluation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
