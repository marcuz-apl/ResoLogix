import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, ImageRun } from 'docx';
import fs from 'fs';
import path from 'path';

export const generateWord = async (reportsDir: string, data: any, contents: any, images: any, activeName: string) => {
  const children: any[] = [];
  const safeName = activeName ? activeName.replace(/[^a-zA-Z0-9-]/g, '_') : 'Evaluation';

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'ResoLogix Evaluation Report', bold: true, size: 48 }),
      ],
      spacing: { after: 400 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Project: ${activeName}`, size: 28, color: '0088CC' }),
      ],
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, size: 24, color: '666666' }),
      ],
      spacing: { after: 800 }
    })
  );

  // Results Table (Transposed for Portrait)
  if (contents.results && data.tableData) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'RESOURCE EVALUATION RESULTS', bold: true, size: 32 })],
        spacing: { after: 200 }
      })
    );

    const headers = ['Parameter', ...data.tableData.map((r: any) => r.prob)];
    const tableRows = [];

    // Header Row
    tableRows.push(
      new TableRow({
        children: headers.map(h => new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
          shading: { fill: 'F7F7F7' }
        }))
      })
    );

    const primaryInPlaceLabel = data.fluidType === 'OIL' ? 'OOIP' : 'OGIP';
    const primaryUnit = data.fluidType === 'OIL' ? 'MMSTB' : 'BCF';
    const secUnit = data.fluidType === 'OIL' ? 'BCF' : 'MMSTB';

    const cols = [
      { header: 'Area (Acre)', key: 'Area' },
      { header: 'Net Pay (feet)', key: 'h' },
      { header: 'Porosity (frac)', key: 'Phi' },
      { header: 'Sw (frac)', key: 'Sw' },
      { header: data.fluidType === 'OIL' ? 'Bo (bbl/STB)' : 'Bg (bbl/SCF)', key: 'Boi' },
      { header: 'Primary RE (frac)', key: 'RE' },
      { header: 'Secondary RE (frac)', key: 'secRE' },
      { header: `${primaryInPlaceLabel} (${data.fluidType === 'OIL' ? 'MMbbl' : 'BCF'})`, key: 'primaryInPlace' },
      { header: `Primary Yield (${primaryUnit})`, key: 'primaryLiquid' },
      { header: `Secondary Yield (${secUnit})`, key: 'secondaryFluid' },
      { header: 'Total Yield (MMBOE)', key: 'totalBOE' }
    ];

    cols.forEach(col => {
      const rowCells = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: col.header, bold: true })] })], shading: { fill: 'F7F7F7' } })
      ];
      data.tableData.forEach((d: any) => {
        const val = d[col.key] ? d[col.key].toFixed(2) : '-';
        rowCells.push(new TableCell({ children: [new Paragraph(val)] }));
      });
      tableRows.push(new TableRow({ children: rowCells }));
    });

    children.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }),
      new Paragraph({ spacing: { after: 600 } })
    );
  }

  // Geological Risk
  if (contents.risk && data.riskFactors) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'GEOLOGICAL RISK', bold: true, size: 32 })],
        spacing: { after: 200 }
      })
    );

    const riskData = [
      ['RISK FACTOR', 'PROB'],
      ['Source', data.riskFactors.source.toFixed(2)],
      ['Timing / Migration', data.riskFactors.migration.toFixed(2)],
      ['Reservoir Quality', data.riskFactors.reservoir.toFixed(2)],
      ['Closures', data.riskFactors.closure.toFixed(2)],
      ['Containment / Seal', data.riskFactors.containment.toFixed(2)],
      ['Chance of Success (Pg)', (data.calculatedPg * 100).toFixed(1) + '%']
    ];

    const riskRows = riskData.map((row, i) => new TableRow({
      children: row.map(cell => new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: cell, bold: i === 0 })] })],
        shading: i === 0 ? { fill: 'F7F7F7' } : undefined
      }))
    }));

    children.push(
      new Table({
        rows: riskRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }),
      new Paragraph({ spacing: { after: 600 } })
    );
  }

  // Resource Profile
  if (contents.profile && data.profileData) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'RESOURCE PROFILE', bold: true, size: 32 })],
        spacing: { after: 200 }
      })
    );

    const profileData = [
      ['PARAMETER', 'VALUE'],
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

    const profileRows = profileData.map((row, i) => new TableRow({
      children: row.map(cell => new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: cell, bold: i === 0 })] })],
        shading: i === 0 ? { fill: 'F7F7F7' } : undefined
      }))
    }));

    children.push(
      new Table({
        rows: profileRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }),
      new Paragraph({ spacing: { after: 600 } })
    );
  }

  // Images
  if (contents.plots && images) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'PROBABILITY DISTRIBUTIONS', bold: true, size: 32 })],
        spacing: { after: 200 }
      })
    );

    const addImage = (base64Str: string) => {
      const buffer = Buffer.from(base64Str.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: { width: 600, height: 330 },
              type: 'png'
            } as any)
          ],
          spacing: { after: 200 }
        })
      );
    };

    if (images.primaryCdf) addImage(images.primaryCdf);
    if (images.primaryPdf) addImage(images.primaryPdf);
    if (images.secondaryCdf) addImage(images.secondaryCdf);
    if (images.secondaryPdf) addImage(images.secondaryPdf);
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(reportsDir, `${safeName}_Report.docx`);
  fs.writeFileSync(outputPath, buffer);
};
