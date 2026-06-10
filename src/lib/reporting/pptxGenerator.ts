import pptxgen from 'pptxgenjs';
import path from 'path';

export const generatePptx = async (reportsDir: string, data: any, contents: any, images: any, activeName: string) => {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // --- SLIDE 1: Title Page ---
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: 'FFFFFF' }; // White background

  titleSlide.addText('ResoLogix', {
    x: 1, y: 1.5, w: 8, h: 1,
    fontSize: 44, color: '363636', bold: true, align: 'center'
  });
  
  titleSlide.addText(activeName, {
    x: 1, y: 3, w: 8, h: 1,
    fontSize: 28, color: '0088CC', align: 'center'
  });

  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  titleSlide.addText(dateStr, {
    x: 1, y: 4.5, w: 8, h: 1,
    fontSize: 18, color: '666666', align: 'center'
  });

  // --- SLIDE 2: Evaluation Results ---
  if (contents.results && data.tableData) {
    const resultsSlide = pptx.addSlide();
    resultsSlide.addText('RESOURCE EVALUATION RESULTS', { x: 0.5, y: 0.5, fontSize: 24, bold: true });

    const headers = [
      'PROB', 'Area', 'h', 'Phi', 'Sw', 'Boi/Bgi', 'Pri RE', 'Sec RE', 'In-Place', 'Pri Yield', 'Sec Yield', 'Total BOE'
    ];

    const tableRows = [headers];
    
    data.tableData.forEach((r: any) => {
      tableRows.push([
        r.prob,
        r.Area ? r.Area.toFixed(2) : '-',
        r.h ? r.h.toFixed(2) : '-',
        r.Phi ? r.Phi.toFixed(2) : '-',
        r.Sw ? r.Sw.toFixed(2) : '-',
        r.Boi ? r.Boi.toFixed(2) : '-',
        r.RE ? r.RE.toFixed(2) : '-',
        r.secRE ? r.secRE.toFixed(2) : '-',
        r.primaryInPlace ? r.primaryInPlace.toFixed(2) : '-',
        r.primaryLiquid ? r.primaryLiquid.toFixed(2) : '-',
        r.secondaryFluid ? r.secondaryFluid.toFixed(2) : '-',
        r.totalBOE ? r.totalBOE.toFixed(2) : '-'
      ]);
    });

    resultsSlide.addTable(tableRows as any, {
      x: 0.5, y: 1.5, w: 9, 
      colW: [0.8, 0.7, 0.7, 0.7, 0.7, 0.8, 0.7, 0.7, 0.9, 0.9, 0.9, 0.9],
      border: { type: 'solid', pt: 1, color: 'CCCCCC' },
      fill: { color: 'F7F7F7' },
      fontSize: 10,
      autoPage: true
    });
  }

  // --- SLIDE 3: Geological Risk ---
  if (contents.risk && data.riskFactors) {
    const riskSlide = pptx.addSlide();
    riskSlide.addText('GEOLOGICAL RISK', { x: 0.5, y: 0.5, fontSize: 24, bold: true });

    const riskRows = [
      ['RISK FACTOR', 'PROB'],
      ['Source', data.riskFactors.source.toFixed(2)],
      ['Timing / Migration', data.riskFactors.migration.toFixed(2)],
      ['Reservoir Quality', data.riskFactors.reservoir.toFixed(2)],
      ['Closures', data.riskFactors.closure.toFixed(2)],
      ['Containment / Seal', data.riskFactors.containment.toFixed(2)],
      ['Chance of Success (Pg)', (data.calculatedPg * 100).toFixed(1) + '%']
    ];

    riskSlide.addTable(riskRows as any, {
      x: 2.5, y: 1.5, w: 5,
      border: { type: 'solid', pt: 1, color: 'CCCCCC' },
      fill: { color: 'F7F7F7' },
      fontSize: 14
    });
  }

  // --- SLIDE: Resource Profile ---
  if (contents.profile && data.profileData) {
    const profileSlide = pptx.addSlide();
    profileSlide.addText('RESOURCE PROFILE', { x: 0.5, y: 0.5, fontSize: 24, bold: true });

    const profileRows = [
      ['PARAMETER', 'VALUE'],
      ['Country', data.profileData.country],
      ['Geological Basin', data.profileData.geolBasin],
      ['Play Type', data.profileData.playType],
      ['Reservoir Age', data.profileData.reservoirAge],
      ['Lithology', data.profileData.lithology],
      ['Depositional Environment', data.profileData.depoEnv],
      ['Exploration Stage', data.profileData.expStage],
      ['Terrain / Depth', data.profileData.terrain],
      ['Lahee Class', data.profileData.laheeClass],
      ['Type Well', data.profileData.typeWell]
    ];

    profileSlide.addTable(profileRows as any, {
      x: 2.5, y: 1.5, w: 5,
      border: { type: 'solid', pt: 1, color: 'CCCCCC' },
      fill: { color: 'F7F7F7' },
      fontSize: 12
    });
  }

  // --- SLIDES: Probability Distributions (Images) ---
  if (contents.plots && images) {
    // Primary Product Slide
    if (images.primaryCdf || images.primaryPdf) {
      const primarySlide = pptx.addSlide();
      primarySlide.addText('PROBABILITY DISTRIBUTIONS (PRIMARY)', { x: 0.5, y: 0.3, fontSize: 24, bold: true });

      if (images.primaryCdf) {
        primarySlide.addImage({ data: images.primaryCdf, x: 1.5, y: 1.0, w: 7, h: 2.1 });
      }
      if (images.primaryPdf) {
        primarySlide.addImage({ data: images.primaryPdf, x: 1.5, y: 3.3, w: 7, h: 2.1 });
      }
    }

    // Secondary Product Slide
    if (images.secondaryCdf || images.secondaryPdf) {
      const secondarySlide = pptx.addSlide();
      secondarySlide.addText('PROBABILITY DISTRIBUTIONS (SECONDARY)', { x: 0.5, y: 0.3, fontSize: 24, bold: true });

      if (images.secondaryCdf) {
        secondarySlide.addImage({ data: images.secondaryCdf, x: 1.5, y: 1.0, w: 7, h: 2.1 });
      }
      if (images.secondaryPdf) {
        secondarySlide.addImage({ data: images.secondaryPdf, x: 1.5, y: 3.3, w: 7, h: 2.1 });
      }
    }
  }

  const outputPath = path.join(reportsDir, 'Evaluation_Report.pptx');
  await pptx.writeFile({ fileName: outputPath });
};
