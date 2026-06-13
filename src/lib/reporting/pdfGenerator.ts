import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generatePdf = (reportsDir: string, data: any, contents: any, images: any, activeName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const safeName = activeName ? activeName.replace(/[^a-zA-Z0-9-]/g, '_') : 'Evaluation';
      const outputPath = path.join(reportsDir, `${safeName}_Report.pdf`);
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
        doc.addPage();
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
        doc.addPage();
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

      // Petroleum Economics & EMV
      if (contents.economics && data.econParams && data.emvParams) {
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('PETROLEUM ECONOMICS & EMV');
        doc.moveDown(1);

        const formatCurrency = (val: number) => `$${val.toFixed(1)}M`;
        const pvSuccess = (0.3 * data.emvParams.npv90) + (0.4 * data.emvParams.npv50) + (0.3 * data.emvParams.npv10);
        const emv = (pvSuccess * data.calculatedPg) - (data.emvParams.dryHoleCost * (1 - data.calculatedPg));

        const econHeaders = ['METRIC', 'VALUE'];
        const econRows = [
          ['Oil Price ($/bbl)', `$${data.econParams.oilPrice}`],
          ['Gas Price ($/Mcf)', `$${data.econParams.gasPrice}`],
          ['OPEX ($/boe)', `$${data.econParams.opex}`],
          ['Initial CapEx ($MM)', `$${data.emvParams.dryHoleCost}M`],
          ['Discount Rate (%)', `${data.econParams.discountRate}%`],
          ['Project Life (Years)', `${data.econParams.projectLife}`],
          ['Annual Decline (%)', `${data.econParams.declineRate}%`],
          ['P90 NPV ($MM)', formatCurrency(data.emvParams.npv90)],
          ['P50 NPV ($MM)', formatCurrency(data.emvParams.npv50)],
          ['P10 NPV ($MM)', formatCurrency(data.emvParams.npv10)],
          ['Mean PV of Success', formatCurrency(pvSuccess)],
          ['Expected Monetary Value (EMV)', formatCurrency(emv)]
        ];
        drawTable(econHeaders, econRows, 400);
      }

      // Images
      if (contents.plots && images) {
        let imageCount = 0;
        const addImage = (base64Str: string, title: string) => {
          if (imageCount === 0 || imageCount % 2 === 0) {
            doc.addPage();
          }
          if (imageCount === 0) {
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('PROBABILITY DISTRIBUTIONS', { align: 'left' });
            doc.moveDown(2);
          }
          doc.fontSize(12).font('Helvetica').fillColor('#333333').text(title, { align: 'center' });
          doc.moveDown(1);
          const buffer = Buffer.from(base64Str.replace(/^data:image\/\w+;base64,/, ''), 'base64');
          // Scale image to full usable page width (512 points)
          doc.image(buffer, { fit: [512, 280], align: 'center' });
          doc.moveDown(2); // Add a blank line between images
          imageCount++;
        };

        if (images.primaryCdf) addImage(images.primaryCdf, 'Primary CDF');
        if (images.primaryPdf) addImage(images.primaryPdf, 'Primary PDF');
        if (images.secondaryCdf) addImage(images.secondaryCdf, 'Secondary CDF');
        if (images.secondaryPdf) addImage(images.secondaryPdf, 'Secondary PDF');
      }

      doc.end();
      
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
