import pptxgen from 'pptxgenjs';
import path from 'path';

export const generatePptx = async (reportsDir: string, data: any, contents: any, images: any, activeName: string) => {
  const pptx = new pptxgen();
  const safeName = activeName ? activeName.replace(/[^a-zA-Z0-9-]/g, '_') : 'Evaluation';
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

    const primaryInPlaceLabel = data.fluidType === 'OIL' ? 'OOIP' : 'OGIP';
    const primaryUnit = data.fluidType === 'OIL' ? 'MMSTB' : 'BCF';
    const secUnit = data.fluidType === 'OIL' ? 'BCF' : 'MMSTB';

    const headers = [
      'PROB', 'Area\n(Acre)', 'h\n(feet)', 'Phi\n(frac)', 'Sw\n(frac)', data.fluidType === 'OIL' ? 'Bo\n(bbl/STB)' : 'Bg\n(bbl/SCF)', 'Pri RE\n(frac)', 'Sec RE\n(frac)', `${primaryInPlaceLabel}\n(${data.fluidType === 'OIL' ? 'MMbbl' : 'BCF'})`, `Pri Yield\n(${primaryUnit})`, `Sec Yield\n(${secUnit})`, 'Total\n(MMBOE)'
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

  // --- SLIDE: Petroleum Economics & EMV ---
  if (contents.economics && data.econParams && data.emvParams) {
    const econSlide = pptx.addSlide();
    econSlide.addText('PETROLEUM ECONOMICS & EMV', { x: 0.5, y: 0.5, fontSize: 24, bold: true });

    const pvSuccess = (0.3 * data.emvParams.npv90) + (0.4 * data.emvParams.npv50) + (0.3 * data.emvParams.npv10);
    const emv = (pvSuccess * data.calculatedPg) - (data.emvParams.dryHoleCost * (1 - data.calculatedPg));

    const econRows = [
      ['METRIC', 'VALUE'],
      ['Oil Price ($/bbl)', `$${data.econParams.oilPrice}`],
      ['Gas Price ($/Mcf)', `$${data.econParams.gasPrice}`],
      ['OPEX ($/boe)', `$${data.econParams.opex}`],
      ['Initial CapEx ($MM)', `$${data.emvParams.dryHoleCost}M`],
      ['Discount Rate (%)', `${data.econParams.discountRate}%`],
      ['Project Life (Years)', `${data.econParams.projectLife}`],
      ['Annual Decline (%)', `${data.econParams.declineRate}%`],
      ['P90 NPV ($MM)', `$${data.emvParams.npv90.toFixed(1)}M`],
      ['P50 NPV ($MM)', `$${data.emvParams.npv50.toFixed(1)}M`],
      ['P10 NPV ($MM)', `$${data.emvParams.npv10.toFixed(1)}M`],
      ['Mean PV of Success ($MM)', `$${pvSuccess.toFixed(1)}M`],
      ['Expected Monetary Value ($MM)', `$${emv.toFixed(1)}M`]
    ];

    econSlide.addTable(econRows as any, {
      x: 2.5, y: 1.5, w: 5,
      border: { type: 'solid', pt: 1, color: 'CCCCCC' },
      fill: { color: 'F7F7F7' },
      fontSize: 12
    });
  }

  // --- SLIDES: Probability Distributions (Images) ---
  if (contents.plots && images) {
    if (images.primaryCdf) {
      const slide = pptx.addSlide();
      slide.addText('PRIMARY EXCEEDANCE (CDF) PLOT', { x: 0.5, y: 0.3, fontSize: 24, bold: true });
      slide.addImage({ data: images.primaryCdf, x: 0.5, y: 1.0, w: 9, h: 4.2 });
    }
    if (images.primaryPdf) {
      const slide = pptx.addSlide();
      slide.addText('PRIMARY DISTRIBUTION (PDF) PLOT', { x: 0.5, y: 0.3, fontSize: 24, bold: true });
      slide.addImage({ data: images.primaryPdf, x: 0.5, y: 1.0, w: 9, h: 4.2 });
    }

    if (images.secondaryCdf) {
      const slide = pptx.addSlide();
      slide.addText('SECONDARY EXCEEDANCE (CDF) PLOT', { x: 0.5, y: 0.3, fontSize: 24, bold: true });
      slide.addImage({ data: images.secondaryCdf, x: 0.5, y: 1.0, w: 9, h: 4.2 });
    }
    if (images.secondaryPdf) {
      const slide = pptx.addSlide();
      slide.addText('SECONDARY DISTRIBUTION (PDF) PLOT', { x: 0.5, y: 0.3, fontSize: 24, bold: true });
      slide.addImage({ data: images.secondaryPdf, x: 0.5, y: 1.0, w: 9, h: 4.2 });
    }
  }

  const outputPath = path.join(reportsDir, `${safeName}_Report.pptx`);
  await pptx.writeFile({ fileName: outputPath });
};
