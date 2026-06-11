import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    // Safety check to ensure we only delete within the reports directory
    const safeJobId = jobId.replace(/(\.\.[\/\\])+/g, '');
    const reportsDir = path.join(process.cwd(), 'reports', safeJobId);

    if (fs.existsSync(reportsDir)) {
      fs.rmSync(reportsDir, { recursive: true, force: true });
      return NextResponse.json({ success: true, message: 'Cleanup complete' });
    } else {
      return NextResponse.json({ success: true, message: 'Folder already cleaned or not found' });
    }
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cleanup' }, { status: 500 });
  }
}
