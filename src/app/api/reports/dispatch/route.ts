import { NextRequest, NextResponse } from 'next/server';
import { zipReports } from '@/lib/reporting/zipManager';
import { sendEmailWithZip } from '@/lib/reporting/emailService';
import { uploadToCloudDrive } from '@/lib/reporting/cloudService';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { jobId, destination, destinationConfig, activeName } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const reportsDir = path.join(process.cwd(), 'reports', jobId);
    if (!fs.existsSync(reportsDir)) {
      return NextResponse.json({ error: 'Report folder not found or expired.' }, { status: 404 });
    }

    const zipPath = path.join(reportsDir, `${jobId}.zip`);

    // Zip if not already zipped
    let zipFile = zipPath;
    if (!fs.existsSync(zipPath)) {
      zipFile = await zipReports(reportsDir, jobId);
    }

    let message = 'Zip created locally.';

    if (destination === 'email' && destinationConfig?.email) {
      message = await sendEmailWithZip(destinationConfig.email, zipFile, activeName || 'Project');
    } else if (destination === 'cloud' && destinationConfig?.cloud) {
      await uploadToCloudDrive(destinationConfig.cloud, zipFile, activeName || 'Project');
      message = 'Uploaded to cloud successfully.';
    }

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Dispatch error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error during dispatch' }, { status: 500 });
  }
}
