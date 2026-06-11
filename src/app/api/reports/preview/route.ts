import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');
  const format = searchParams.get('format') || 'pdf';

  if (!jobId) {
    return new NextResponse('Missing jobId', { status: 400 });
  }

  const reportsDir = path.join(process.cwd(), 'reports', jobId);
  
  if (!fs.existsSync(reportsDir)) {
    return new NextResponse('Report expired or not found. Please regenerate.', { status: 404 });
  }

  const files = fs.readdirSync(reportsDir);
  
  // Match extension based on format
  const extensionMap: Record<string, string> = {
    excel: '.xlsx',
    pptx: '.pptx',
    word: '.docx',
    pdf: '.pdf'
  };
  
  const targetExt = extensionMap[format];
  const targetFile = files.find(f => f.endsWith(targetExt));

  if (!targetFile) {
    return new NextResponse('Preview not available for this format.', { status: 404 });
  }

  const filePath = path.join(reportsDir, targetFile);
  const fileBuffer = fs.readFileSync(filePath);

  const contentTypeMap: Record<string, string> = {
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdf: 'application/pdf'
  };

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentTypeMap[format] || 'application/octet-stream',
      // For PDF we can use inline, for others it usually prompts download unless the OS has a default handler
      'Content-Disposition': format === 'pdf' ? 'inline' : `inline; filename="${targetFile}"`,
    },
  });
}
