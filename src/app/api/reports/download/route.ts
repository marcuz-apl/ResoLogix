import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  const zipPath = path.join(process.cwd(), 'reports', jobId, `${jobId}.zip`);

  if (!fs.existsSync(zipPath)) {
    return NextResponse.json({ error: 'Report expired or not found. Please regenerate.' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(zipPath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="ResoLogix-Report-${jobId}.zip"`,
    },
  });
}
