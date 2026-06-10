import { NextRequest, NextResponse } from 'next/server';
import { generateExcel } from '@/lib/reporting/excelGenerator';
import { generatePptx } from '@/lib/reporting/pptxGenerator';
import { generateWord } from '@/lib/reporting/wordGenerator';
import { generatePdf } from '@/lib/reporting/pdfGenerator';
import { zipReports } from '@/lib/reporting/zipManager';
import { sendEmailWithZip } from '@/lib/reporting/emailService';
import { uploadToCloudDrive } from '@/lib/reporting/cloudService';
import fs from 'fs';
import path from 'path';

// Force dynamic execution
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (msg: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message: msg })}\n\n`));
      };

      const sendComplete = (downloadId: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ complete: true, downloadId })}\n\n`));
        controller.close();
      };

      const sendError = (err: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err })}\n\n`));
        controller.close();
      };

      try {
        const body = await req.json();
        const { formats, contents, activeName, destination, destinationConfig, data, images } = body;

        sendEvent(`Report Generation Started on ${new Date().toLocaleTimeString()}`);
        
        // Setup temporary directory
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const jobId = `report-${timestamp}`;
        const reportsDir = path.join(process.cwd(), 'reports', jobId);
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }

        if (contents.profile || contents.results || contents.risk) {
          sendEvent('Copying Reserve Parameters and Geological Risk Factors');
        }

        if (contents.plots) {
          sendEvent('Processing Probability Distribution Plots');
          // Save images to subfolder
          const imagesDir = path.join(reportsDir, 'images');
          fs.mkdirSync(imagesDir, { recursive: true });
          
          if (images.primaryPdf) fs.writeFileSync(path.join(imagesDir, 'Primary_PDF.png'), images.primaryPdf.split('base64,')[1], 'base64');
          if (images.primaryCdf) fs.writeFileSync(path.join(imagesDir, 'Primary_CDF.png'), images.primaryCdf.split('base64,')[1], 'base64');
          if (images.secondaryPdf) fs.writeFileSync(path.join(imagesDir, 'Secondary_PDF.png'), images.secondaryPdf.split('base64,')[1], 'base64');
          if (images.secondaryCdf) fs.writeFileSync(path.join(imagesDir, 'Secondary_CDF.png'), images.secondaryCdf.split('base64,')[1], 'base64');
        }

        if (formats.excel) {
          sendEvent('Generating Summary Data Tables (Excel)');
          await generateExcel(reportsDir, data, contents);
        }

        if (formats.pptx) {
          sendEvent('Generating PPTX Slides');
          await generatePptx(reportsDir, data, contents, images, activeName);
        }

        if (formats.word) {
          sendEvent('Generating Word Report');
          await generateWord(reportsDir, data, contents, images, activeName);
        }

        if (formats.pdf) {
          sendEvent('Generating PDF Report');
          await generatePdf(reportsDir, data, contents, images, activeName);
        }

        sendEvent('Zipping and Compressing Reports');
        const zipFile = await zipReports(reportsDir, jobId);

        if (destination === 'email' && destinationConfig?.email) {
          sendEvent(`Dispatching Email to ${destinationConfig.email}`);
          const msg = await sendEmailWithZip(destinationConfig.email, zipFile, activeName || 'Project');
          sendEvent(msg);
        } else if (destination === 'cloud' && destinationConfig?.cloud) {
          sendEvent('Uploading to Cloud Drive');
          await uploadToCloudDrive(destinationConfig.cloud, zipFile, activeName || 'Project');
        }

        sendEvent(`Report Generation Completed at ${new Date().toLocaleTimeString()}`);
        
        // The zip is ready. Return the ID for download.
        sendComplete(jobId);

      } catch (error: any) {
        console.error('Report generation error:', error);
        sendError(error.message || 'Unknown error occurred');
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
