import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generatePdf = (reportsDir: string, data: any, contents: any, images: any, activeName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const outputPath = path.join(reportsDir, 'Evaluation_Report.pdf');
      const writeStream = fs.createWriteStream(outputPath);

      doc.pipe(writeStream);

      // Title
      doc.fontSize(24).font('Helvetica-Bold').text('ResoLogix Evaluation Report', { align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(16).font('Helvetica').fillColor('#0088CC').text(`Project: ${activeName}`, { align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#666666').text(`Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'left' });
      doc.moveDown(3);

      const drawTable = (headers: string[], rows: any[][], tableWidth: number = 512) => {
        let y = doc.y;
        const xOffset = (612 - tableWidth) / 2;
        const colWidth = tableWidth / headers.length;

        // Draw Headers
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
        headers.forEach((h, i) => {
          doc.text(h, xOffset + (i * colWidth), y, { width: colWidth, align: 'left' });
        });
        y += 20;
        doc.moveTo(xOffset, y).lineTo(xOffset + tableWidth, y).stroke();
        y += 5;

        // Draw Rows
        doc.font('Helvetica');
        rows.forEach(row => {
          if (y > 700) { doc.addPage(); y = 50; }
          row.forEach((cell, i) => {
            doc.text(String(cell), xOffset + (i * colWidth), y, { width: colWidth, align: 'left' });
          });
          y += 20;
          doc.moveTo(xOffset, y).lineTo(xOffset + tableWidth, y).strokeColor('#E2E8F0').stroke();
          y += 5;
        });
        doc.y = y + 20;
      };

      // Results Table
      if (contents.results && data.tableData) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('RESOURCE EVALUATION RESULTS');
        doc.moveDown(1);
        
        const headers = ['Parameter', ...data.tableData.map((r: any) => r.prob)];
        const primaryInPlaceLabel = data.fluidType === 'OIL' ? 'OOIP' : 'OGIP';
        const primaryUnit = data.fluidType === 'OIL' ? 'MMSTB' : 'BCF';
        const secUnit = data.fluidType === 'OIL' ? 'BCF' : 'MMSTB';

        const cols = [
          { header: 'Area (Acre)', key: 'Area' },
          { header: 'h (feet)', key: 'h' },
          { header: 'Phi (frac)', key: 'Phi' },
          { header: 'Sw (frac)', key: 'Sw' },
          { header: data.fluidType === 'OIL' ? 'Bo (bbl/STB)' : 'Bg (bbl/SCF)', key: 'Boi' },
          { header: 'Pri RE (frac)', key: 'RE' },
          { header: 'Sec RE (frac)', key: 'secRE' },
          { header: `${primaryInPlaceLabel} (${data.fluidType === 'OIL' ? 'MMbbl' : 'BCF'})`, key: 'primaryInPlace' },
          { header: `Pri Yield (${primaryUnit})`, key: 'primaryLiquid' },
          { header: `Sec Yield (${secUnit})`, key: 'secondaryFluid' },
          { header: 'Total (MMBOE)', key: 'totalBOE' }
        ];

        const rows = cols.map(col => {
          const row = [col.header];
          data.tableData.forEach((d: any) => {
            row.push(d[col.key] ? d[col.key].toFixed(2) : '-');
          });
          return row;
        });

        drawTable(headers, rows, 512);
      }

      // Geological Risk
      if (contents.risk && data.riskFactors) {
        if (doc.y > 600) doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('GEOLOGICAL RISK');
        doc.moveDown(1);

        const riskHeaders = ['RISK FACTOR', 'PROB'];
        const riskRows = [
          ['Source', data.riskFactors.source.toFixed(2)],
          ['Timing / Migration', data.riskFactors.migration.toFixed(2)],
          ['Reservoir Quality', data.riskFactors.reservoir.toFixed(2)],
          ['Closures', data.riskFactors.closure.toFixed(2)],
          ['Containment / Seal', data.riskFactors.containment.toFixed(2)],
          ['Chance of Success (Pg)', (data.calculatedPg * 100).toFixed(1) + '%']
        ];
        drawTable(riskHeaders, riskRows, 400);
      }

      // Resource Profile
      if (contents.profile && data.profileData) {
        if (doc.y > 600) doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('RESOURCE PROFILE');
        doc.moveDown(1);

        const profileHeaders = ['PARAMETER', 'VALUE'];
        const profileRows = [
          ['Country', data.profileData.country || '-'],
          ['Geological Basin', data.profileData.geolBasin || '-'],
          ['Play Type', data.profileData.playType || '-'],
          ['Reservoir Age', data.profileData.reservoirAge || '-'],
          ['Lithology', data.profileData.lithology || '-'],
          ['Depositional Environment', data.profileData.depoEnv || '-'],
          ['Exploration Stage', data.profileData.expStage || '-'],
          ['Terrain / Depth', data.profileData.terrain || '-'],
          ['Lahee Class', data.profileData.laheeClass || '-'],
          ['Type Well', data.profileData.typeWell || '-']
        ];
        drawTable(profileHeaders, profileRows, 400);
      }

      // Images
      if (contents.plots && images) {
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('PROBABILITY DISTRIBUTIONS', { align: 'left' });
        doc.moveDown(2);

        let imageCount = 0;
        const addImage = (base64Str: string) => {
          if (imageCount > 0 && imageCount % 2 === 0) {
            doc.addPage();
            doc.moveDown(2);
          }
          const buffer = Buffer.from(base64Str.replace(/^data:image\/\w+;base64,/, ''), 'base64');
          // Center the image manually by passing `x` if `align` doesn't work perfectly for images,
          // but `align: center` usually works in pdfkit if width is specified.
          doc.image(buffer, { fit: [450, 250], align: 'center' });
          doc.moveDown(15); // Move down past image
          imageCount++;
        };

        if (images.primaryCdf) addImage(images.primaryCdf);
        if (images.primaryPdf) addImage(images.primaryPdf);
        if (images.secondaryCdf) addImage(images.secondaryCdf);
        if (images.secondaryPdf) addImage(images.secondaryPdf);
      }

      doc.end();

      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
};
