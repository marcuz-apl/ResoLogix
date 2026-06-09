import jsPDF from 'jspdf';
import 'jspdf-autotable';
import pptxgen from 'pptxgenjs';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  ImageRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  WidthType,
  TableBorders
} from 'docx';
import { getPercentile } from './statistics';

export interface ReportConfig {
  activeName: string;
  activeDescription: string;
  fluidType: 'OIL' | 'GAS';
  includeSecondary: boolean;
  country: string;
  geolBasin: string;
  playType: string;
  reservoirAge: string;
  lithology: string;
  depoEnv: string;
  expStage: string;
  terrain: string;
  laheeClass: string;
  simResults: any;
  riskFactors: any;
  calculatedPg: number;
  reportReserveProfile: boolean;
  reportParamsResults: boolean;
  reportGeologicalRisk: boolean;
  reportPlots: boolean;
  chartImages: {
    primaryExceedance?: string;
    primaryPdf?: string;
    secondaryExceedance?: string;
    secondaryPdf?: string;
  };
}

// Scale helper
const scaleValue = (val: number, fluidType: 'OIL' | 'GAS', type = 'primary') => {
  if (type === 'primary') {
    const scaleFactor = fluidType === 'OIL' ? 1e6 : 1e9;
    return val / scaleFactor;
  } else {
    const scaleFactor = fluidType === 'OIL' ? 1e9 : 1e6;
    return val / scaleFactor;
  }
};

// Format helper
const formatVal = (val: number, fluidType: 'OIL' | 'GAS', type = 'primary') => {
  return scaleValue(val, fluidType, type).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  });
};

// PDF Builder
export async function buildPDF(config: ReportConfig): Promise<Blob> {
  const {
    activeName,
    activeDescription,
    fluidType,
    includeSecondary,
    country,
    geolBasin,
    playType,
    reservoirAge,
    lithology,
    depoEnv,
    expStage,
    terrain,
    laheeClass,
    simResults,
    riskFactors,
    calculatedPg,
    reportReserveProfile,
    reportParamsResults,
    reportGeologicalRisk,
    reportPlots,
    chartImages
  } = config;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Premium Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('ResoLogix Evaluation Report', 15, 18);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Scenario: ${activeName}   |   Date: ${new Date().toLocaleString()}`, 15, 28);

  let cursorY = 50;

  // Metadata block
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('1. Scenario Overview', 15, cursorY);
  cursorY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Description: ${activeDescription || 'No description provided.'}`, 15, cursorY);
  cursorY += 6;
  doc.text(`Fluid Type: ${fluidType === 'OIL' ? 'Oil Reservoir' : 'Gas Reservoir'}`, 15, cursorY);
  cursorY += 6;
  doc.text(`Secondary Associated Product: ${includeSecondary ? 'Yes' : 'No'}`, 15, cursorY);
  cursorY += 12;

  // Reserve Profile Section
  if (reportReserveProfile) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('2. Geological Reserve Profile', 15, cursorY);
    cursorY += 6;

    const profileData = [
      ['Country', country],
      ['Geological Basin', geolBasin],
      ['Play Type', playType],
      ['Reservoir Age', reservoirAge],
      ['Lithology', lithology],
      ['Depositional Env.', depoEnv],
      ['Exploration Stage', expStage],
      ['Terrain', terrain],
      ['Lahee Classification', laheeClass]
    ];

    (doc as any).autoTable({
      body: profileData,
      startY: cursorY,
      margin: { left: 15, right: 15 },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 1.5 },
      columnStyles: {
        0: { fontStyle: 'bold', width: 50 },
        1: { width: 130 }
      }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 12;
  }

  // Parameters and Results Section
  if (reportParamsResults && simResults) {
    if (cursorY > 240) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('3. Volumetric Simulation Results', 15, cursorY);
    cursorY += 6;

    // Percentiles table (Columns as Percentiles)
    const getVal = (runs: number[] | undefined, pct: number) => {
      if (!runs || runs.length === 0) return 0;
      const sorted = [...runs].sort((a, b) => a - b);
      return getPercentile(sorted, pct);
    };

    const tableHeaders = [['Parameter', 'Unit', 'P90', 'P50', 'P10', 'Mean Success']];

    const p90_A = getVal(simResults.A_runs, 10);
    const p50_A = getVal(simResults.A_runs, 50);
    const p10_A = getVal(simResults.A_runs, 90);
    const mean_A = simResults.A_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.A_runs.length;

    const p90_h = getVal(simResults.h_runs, 10);
    const p50_h = getVal(simResults.h_runs, 50);
    const p10_h = getVal(simResults.h_runs, 90);
    const mean_h = simResults.h_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.h_runs.length;

    const p90_phi = getVal(simResults.Phi_runs, 10);
    const p50_phi = getVal(simResults.Phi_runs, 50);
    const p10_phi = getVal(simResults.Phi_runs, 90);
    const mean_phi = simResults.Phi_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.Phi_runs.length;

    const p90_sw = getVal(simResults.Sw_runs, 10);
    const p50_sw = getVal(simResults.Sw_runs, 50);
    const p10_sw = getVal(simResults.Sw_runs, 90);
    const mean_sw = simResults.Sw_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.Sw_runs.length;

    const p90_re = getVal(simResults.RE_runs, 10);
    const p50_re = getVal(simResults.RE_runs, 50);
    const p10_re = getVal(simResults.RE_runs, 90);
    const mean_re = simResults.RE_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.RE_runs.length;

    // Reserves Primary
    const p90_ip = getVal(simResults.inPlaceRuns, 10);
    const p50_ip = getVal(simResults.inPlaceRuns, 50);
    const p10_ip = getVal(simResults.inPlaceRuns, 90);
    const mean_ip = simResults.inPlaceStats.mean;

    const p90_rec = getVal(simResults.recoverableRuns, 10);
    const p50_rec = getVal(simResults.recoverableRuns, 50);
    const p10_rec = getVal(simResults.recoverableRuns, 90);
    const mean_rec = simResults.recoverableStats.mean;

    const tableRows = [
      ['Drainage Area', 'acres', p90_A.toFixed(1), p50_A.toFixed(1), p10_A.toFixed(1), mean_A.toFixed(1)],
      ['Net Pay Thickness', 'feet', p90_h.toFixed(1), p50_h.toFixed(1), p10_h.toFixed(1), mean_h.toFixed(1)],
      ['Porosity', 'fraction', p90_phi.toFixed(3), p50_phi.toFixed(3), p10_phi.toFixed(3), mean_phi.toFixed(3)],
      ['Water Saturation', 'fraction', p90_sw.toFixed(3), p50_sw.toFixed(3), p10_sw.toFixed(3), mean_sw.toFixed(3)],
      ['Recovery Efficiency', 'fraction', p90_re.toFixed(3), p50_re.toFixed(3), p10_re.toFixed(3), mean_re.toFixed(3)],
      [
        `Hydrocarbon In-Place (${fluidType === 'OIL' ? 'OOIP, MMbbl' : 'OGIP, Bcf'})`,
        fluidType === 'OIL' ? 'MMbbl' : 'Bcf',
        formatVal(p90_ip, fluidType),
        formatVal(p50_ip, fluidType),
        formatVal(p10_ip, fluidType),
        formatVal(mean_ip, fluidType)
      ],
      [
        `Primary Recoverable Reserves`,
        fluidType === 'OIL' ? 'MMbbl' : 'Bcf',
        formatVal(p90_rec, fluidType),
        formatVal(p50_rec, fluidType),
        formatVal(p10_rec, fluidType),
        formatVal(mean_rec, fluidType)
      ]
    ];

    (doc as any).autoTable({
      head: tableHeaders,
      body: tableRows,
      startY: cursorY,
      margin: { left: 15, right: 15 },
      theme: 'striped',
      headStyles: { fillColor: [8, 47, 73] }, // sky-950
      styles: { fontSize: 8.5 }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 12;
  }

  // Geological Risk Section
  if (reportGeologicalRisk) {
    if (cursorY > 240) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('4. Geological Risk Assessment', 15, cursorY);
    cursorY += 6;

    const riskData = [
      ['Geological Factor', 'Probability'],
      ['Source Rock / Charge', `${(riskFactors.source * 100).toFixed(0)}%`],
      ['Timing & Migration', `${(riskFactors.migration * 100).toFixed(0)}%`],
      ['Reservoir Quality', `${(riskFactors.reservoir * 100).toFixed(0)}%`],
      ['Trap Closure / Geometry', `${(riskFactors.closure * 100).toFixed(0)}%`],
      ['Seal / Containment', `${(riskFactors.containment * 100).toFixed(0)}%`],
      ['Geological Chance of Success (Pg)', `${(calculatedPg * 100).toFixed(1)}%`]
    ];

    (doc as any).autoTable({
      body: riskData.slice(1),
      head: [riskData[0]],
      startY: cursorY,
      margin: { left: 15, right: 15 },
      theme: 'grid',
      headStyles: { fillColor: [2, 48, 32] }, // dark green
      styles: { fontSize: 9 }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 12;
  }

  // Probability Distributions Section
  if (reportPlots) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('5. Probability Distribution Plots', 15, 20);
    
    let chartY = 30;
    
    // Embed Primary Exceedance
    if (chartImages.primaryExceedance) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Primary Product Exceedance Curve (CDF)', 15, chartY);
      doc.addImage(chartImages.primaryExceedance, 'PNG', 15, chartY + 2, 180, 90);
      chartY += 105;
    }

    // Embed Primary PDF
    if (chartImages.primaryPdf) {
      if (chartY > 200) {
        doc.addPage();
        chartY = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Primary Product Relative Frequency Density (PDF)', 15, chartY);
      doc.addImage(chartImages.primaryPdf, 'PNG', 15, chartY + 2, 180, 90);
      chartY += 105;
    }

    // Embed Secondary
    if (includeSecondary) {
      if (chartImages.secondaryExceedance) {
        if (chartY > 200) {
          doc.addPage();
          chartY = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Secondary Product Exceedance Curve (CDF)', 15, chartY);
        doc.addImage(chartImages.secondaryExceedance, 'PNG', 15, chartY + 2, 180, 90);
        chartY += 105;
      }

      if (chartImages.secondaryPdf) {
        if (chartY > 200) {
          doc.addPage();
          chartY = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Secondary Product Relative Frequency Density (PDF)', 15, chartY);
        doc.addImage(chartImages.secondaryPdf, 'PNG', 15, chartY + 2, 180, 90);
      }
    }
  }

  return doc.output('blob');
}

// PPTX Slide Builder
export async function buildPPTX(config: ReportConfig): Promise<Blob> {
  const {
    activeName,
    activeDescription,
    fluidType,
    includeSecondary,
    country,
    geolBasin,
    playType,
    reservoirAge,
    lithology,
    depoEnv,
    expStage,
    terrain,
    laheeClass,
    simResults,
    riskFactors,
    calculatedPg,
    reportReserveProfile,
    reportParamsResults,
    reportGeologicalRisk,
    reportPlots,
    chartImages
  } = config;

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Master Dark Slide Background Styling
  const darkThemeBg = { color: '0F172A' }; // slate-900

  // 1. Title Slide
  const s1 = pptx.addSlide();
  s1.background = darkThemeBg;
  
  s1.addText('ResoLogix Evaluation Report', {
    x: '5%',
    y: '30%',
    w: '90%',
    h: 1.2,
    fontSize: 36,
    bold: true,
    color: '38BDF8', // light sky blue
    fontFace: 'Helvetica'
  });

  s1.addText(`Scenario: ${activeName}\nDescription: ${activeDescription || 'No description.'}`, {
    x: '5%',
    y: '45%',
    w: '90%',
    h: 1.5,
    fontSize: 16,
    color: '94A3B8', // slate-400
    fontFace: 'Helvetica'
  });

  s1.addText(`Fluid Type: ${fluidType === 'OIL' ? 'Oil' : 'Gas'} Reservoir   |   Date: ${new Date().toLocaleDateString()}`, {
    x: '5%',
    y: '75%',
    w: '90%',
    h: 0.5,
    fontSize: 12,
    color: '64748B', // slate-500
    fontFace: 'Helvetica'
  });

  // 2. Reserve Profile Slide
  if (reportReserveProfile) {
    const s2 = pptx.addSlide();
    s2.background = darkThemeBg;

    s2.addText('Geological Reserve Profile', {
      x: '5%',
      y: '5%',
      w: '90%',
      h: 0.8,
      fontSize: 22,
      bold: true,
      color: '38BDF8'
    });

    const rows = [
      [{ text: 'Attribute', options: { bold: true, color: '38BDF8' } }, { text: 'Value', options: { bold: true, color: '38BDF8' } }],
      ['Country', country],
      ['Geological Basin', geolBasin],
      ['Play Type', playType],
      ['Reservoir Age', reservoirAge],
      ['Lithology', lithology],
      ['Depositional Env.', depoEnv],
      ['Exploration Stage', expStage],
      ['Terrain', terrain],
      ['Lahee Classification', laheeClass]
    ];

    s2.addTable(rows as any, {
      x: '5%',
      y: '18%',
      w: '90%',
      h: '70%',
      border: { pt: 1, color: '334155' },
      fill: { color: '1E293B' },
      color: 'F1F5F9',
      fontSize: 10,
      align: 'left'
    });
  }

  // 3. Volumetric Simulation Table Slide (Transposed: Rows as Percentiles for PPTX Landscape)
  if (reportParamsResults && simResults) {
    const s3 = pptx.addSlide();
    s3.background = darkThemeBg;

    s3.addText('Volumetric Reserves Summary', {
      x: '5%',
      y: '5%',
      w: '90%',
      h: 0.8,
      fontSize: 22,
      bold: true,
      color: '38BDF8'
    });

    const getVal = (runs: number[] | undefined, pct: number) => {
      if (!runs || runs.length === 0) return 0;
      const sorted = [...runs].sort((a, b) => a - b);
      return getPercentile(sorted, pct);
    };

    const p90_A = getVal(simResults.A_runs, 10);
    const p50_A = getVal(simResults.A_runs, 50);
    const p10_A = getVal(simResults.A_runs, 90);
    const mean_A = simResults.A_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.A_runs.length;

    const p90_h = getVal(simResults.h_runs, 10);
    const p50_h = getVal(simResults.h_runs, 50);
    const p10_h = getVal(simResults.h_runs, 90);
    const mean_h = simResults.h_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.h_runs.length;

    const p90_phi = getVal(simResults.Phi_runs, 10);
    const p50_phi = getVal(simResults.Phi_runs, 50);
    const p10_phi = getVal(simResults.Phi_runs, 90);
    const mean_phi = simResults.Phi_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.Phi_runs.length;

    const p90_sw = getVal(simResults.Sw_runs, 10);
    const p50_sw = getVal(simResults.Sw_runs, 50);
    const p10_sw = getVal(simResults.Sw_runs, 90);
    const mean_sw = simResults.Sw_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.Sw_runs.length;

    const p90_re = getVal(simResults.RE_runs, 10);
    const p50_re = getVal(simResults.RE_runs, 50);
    const p10_re = getVal(simResults.RE_runs, 90);
    const mean_re = simResults.RE_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.RE_runs.length;

    const p90_ip = getVal(simResults.inPlaceRuns, 10);
    const p50_ip = getVal(simResults.inPlaceRuns, 50);
    const p10_ip = getVal(simResults.inPlaceRuns, 90);
    const mean_ip = simResults.inPlaceStats.mean;

    const p90_rec = getVal(simResults.recoverableRuns, 10);
    const p50_rec = getVal(simResults.recoverableRuns, 50);
    const p10_rec = getVal(simResults.recoverableRuns, 90);
    const mean_rec = simResults.recoverableStats.mean;

    // Transposed layout (Row Names as Percentiles)
    const headers = [
      { text: 'Percentile', options: { bold: true, color: '38BDF8' } },
      { text: 'Area (ac)', options: { bold: true } },
      { text: 'h (ft)', options: { bold: true } },
      { text: 'Phi (fr)', options: { bold: true } },
      { text: 'Sw (fr)', options: { bold: true } },
      { text: 'RE (fr)', options: { bold: true } },
      { text: `In-Place (${fluidType})`, options: { bold: true } },
      { text: `Primary Rec.`, options: { bold: true, color: '34D399' } }
    ];

    const tableRows = [
      headers,
      ['P90', p90_A.toFixed(1), p90_h.toFixed(1), p90_phi.toFixed(3), p90_sw.toFixed(3), p90_re.toFixed(3), formatVal(p90_ip, fluidType), formatVal(p90_rec, fluidType)],
      ['P50', p50_A.toFixed(1), p50_h.toFixed(1), p50_phi.toFixed(3), p50_sw.toFixed(3), p50_re.toFixed(3), formatVal(p50_ip, fluidType), formatVal(p50_rec, fluidType)],
      ['P10', p10_A.toFixed(1), p10_h.toFixed(1), p10_phi.toFixed(3), p10_sw.toFixed(3), p10_re.toFixed(3), formatVal(p10_ip, fluidType), formatVal(p10_rec, fluidType)],
      ['MEAN', mean_A.toFixed(1), mean_h.toFixed(1), mean_phi.toFixed(3), mean_sw.toFixed(3), mean_re.toFixed(3), formatVal(mean_ip, fluidType), formatVal(mean_rec, fluidType)]
    ];

    s3.addTable(tableRows as any, {
      x: '5%',
      y: '20%',
      w: '90%',
      h: '60%',
      border: { pt: 1, color: '334155' },
      fill: { color: '1E293B' },
      color: 'F1F5F9',
      fontSize: 11,
      align: 'center'
    });
  }

  // 4. Geological Risk Slide
  if (reportGeologicalRisk) {
    const s4 = pptx.addSlide();
    s4.background = darkThemeBg;

    s4.addText('Geological Risk Assessment', {
      x: '5%',
      y: '5%',
      w: '90%',
      h: 0.8,
      fontSize: 22,
      bold: true,
      color: '38BDF8'
    });

    const riskRows = [
      [{ text: 'Geological Factor', options: { bold: true, color: '38BDF8' } }, { text: 'Probability', options: { bold: true, color: '38BDF8' } }],
      ['Source Rock / Charge', `${(riskFactors.source * 100).toFixed(0)}%`],
      ['Timing & Migration', `${(riskFactors.migration * 100).toFixed(0)}%`],
      ['Reservoir Quality', `${(riskFactors.reservoir * 100).toFixed(0)}%`],
      ['Trap Closure / Geometry', `${(riskFactors.closure * 100).toFixed(0)}%`],
      ['Seal / Containment', `${(riskFactors.containment * 100).toFixed(0)}%`],
      [{ text: 'Geological Chance of Success (Pg)', options: { bold: true } }, { text: `${(calculatedPg * 100).toFixed(1)}%`, options: { bold: true, color: '34D399' } }]
    ];

    s4.addTable(riskRows as any, {
      x: '5%',
      y: '20%',
      w: '90%',
      h: '55%',
      border: { pt: 1, color: '334155' },
      fill: { color: '1E293B' },
      color: 'F1F5F9',
      fontSize: 12,
      align: 'left'
    });
  }

  // 5. Probability distribution slides (One slide per plot, landscape)
  if (reportPlots) {
    if (chartImages.primaryExceedance) {
      const sp1 = pptx.addSlide();
      sp1.background = darkThemeBg;
      sp1.addText('Primary Exceedance Curve (CDF)', { x: '5%', y: '5%', w: '90%', h: 0.6, fontSize: 20, bold: true, color: '38BDF8' });
      sp1.addImage({ data: chartImages.primaryExceedance, x: '10%', y: '15%', w: '80%', h: '75%' });
    }

    if (chartImages.primaryPdf) {
      const sp2 = pptx.addSlide();
      sp2.background = darkThemeBg;
      sp2.addText('Primary Relative Density Curve (PDF)', { x: '5%', y: '5%', w: '90%', h: 0.6, fontSize: 20, bold: true, color: '38BDF8' });
      sp2.addImage({ data: chartImages.primaryPdf, x: '10%', y: '15%', w: '80%', h: '75%' });
    }

    if (includeSecondary) {
      if (chartImages.secondaryExceedance) {
        const sp3 = pptx.addSlide();
        sp3.background = darkThemeBg;
        sp3.addText('Secondary Exceedance Curve (CDF)', { x: '5%', y: '5%', w: '90%', h: 0.6, fontSize: 20, bold: true, color: '38BDF8' });
        sp3.addImage({ data: chartImages.secondaryExceedance, x: '10%', y: '15%', w: '80%', h: '75%' });
      }

      if (chartImages.secondaryPdf) {
        const sp4 = pptx.addSlide();
        sp4.background = darkThemeBg;
        sp4.addText('Secondary Relative Density Curve (PDF)', { x: '5%', y: '5%', w: '90%', h: 0.6, fontSize: 20, bold: true, color: '38BDF8' });
        sp4.addImage({ data: chartImages.secondaryPdf, x: '10%', y: '15%', w: '80%', h: '75%' });
      }
    }
  }

  // Export as ArrayBuffer/Blob
  const stream: any = await pptx.write({ outputType: 'arraybuffer' });
  return new Blob([stream], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
}

// Word Document (docx) Builder
export async function buildWord(config: ReportConfig): Promise<Blob> {
  const {
    activeName,
    activeDescription,
    fluidType,
    includeSecondary,
    country,
    geolBasin,
    playType,
    reservoirAge,
    lithology,
    depoEnv,
    expStage,
    terrain,
    laheeClass,
    simResults,
    riskFactors,
    calculatedPg,
    reportReserveProfile,
    reportParamsResults,
    reportGeologicalRisk,
    reportPlots,
    chartImages
  } = config;

  const docChildren: any[] = [];

  // Header Title
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: "ResoLogix Evaluation Report",
          bold: true,
          color: "0F172A",
          size: 40
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Scenario Name: ${activeName}\nDate: ${new Date().toLocaleDateString()}`,
          color: "64748B",
          size: 20
        })
      ]
    }),
    new Paragraph({ text: "" }) // spacing
  );

  // Overview Paragraph
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "1. Scenario Overview", bold: true, size: 28 })]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Description: ${activeDescription || 'No description provided.'}\n` }),
        new TextRun({ text: `Reservoir Fluid Type: ${fluidType === 'OIL' ? 'Oil' : 'Gas'} Reservoir\n` }),
        new TextRun({ text: `Secondary Product Included: ${includeSecondary ? 'Yes' : 'No'}` })
      ]
    }),
    new Paragraph({ text: "" })
  );

  // 2. Reserve Profile Section
  if (reportReserveProfile) {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Attribute", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Value", bold: true })] })] })
        ]
      }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph("Country")] }), new TableCell({ children: [new Paragraph(country)] })] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph("Geological Basin")] }), new TableCell({ children: [new Paragraph(geolBasin)] })] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph("Play Type")] }), new TableCell({ children: [new Paragraph(playType)] })] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph("Reservoir Age")] }), new TableCell({ children: [new Paragraph(reservoirAge)] })] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph("Lithology")] }), new TableCell({ children: [new Paragraph(lithology)] })] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph("Depositional Env.")] }), new TableCell({ children: [new Paragraph(depoEnv)] })] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph("Exploration Stage")] }), new TableCell({ children: [new Paragraph(expStage)] })] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph("Terrain")] }), new TableCell({ children: [new Paragraph(terrain)] })] }),
      new TableRow({ children: [new TableCell({ children: [new Paragraph("Lahee Classification")] }), new TableCell({ children: [new Paragraph(laheeClass)] })] })
    ];

    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: "2. Geological Reserve Profile", bold: true, size: 28 })]
      }),
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: TableBorders.NONE
      }),
      new Paragraph({ text: "" })
    );
  }

  // 3. Volumetric Simulation (Columns as Percentiles)
  if (reportParamsResults && simResults) {
    const getVal = (runs: number[] | undefined, pct: number) => {
      if (!runs || runs.length === 0) return 0;
      const sorted = [...runs].sort((a, b) => a - b);
      return getPercentile(sorted, pct);
    };

    const p90_A = getVal(simResults.A_runs, 10);
    const p50_A = getVal(simResults.A_runs, 50);
    const p10_A = getVal(simResults.A_runs, 90);
    const mean_A = simResults.A_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.A_runs.length;

    const p90_h = getVal(simResults.h_runs, 10);
    const p50_h = getVal(simResults.h_runs, 50);
    const p10_h = getVal(simResults.h_runs, 90);
    const mean_h = simResults.h_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.h_runs.length;

    const p90_phi = getVal(simResults.Phi_runs, 10);
    const p50_phi = getVal(simResults.Phi_runs, 50);
    const p10_phi = getVal(simResults.Phi_runs, 90);
    const mean_phi = simResults.Phi_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.Phi_runs.length;

    const p90_sw = getVal(simResults.Sw_runs, 10);
    const p50_sw = getVal(simResults.Sw_runs, 50);
    const p10_sw = getVal(simResults.Sw_runs, 90);
    const mean_sw = simResults.Sw_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.Sw_runs.length;

    const p90_re = getVal(simResults.RE_runs, 10);
    const p50_re = getVal(simResults.RE_runs, 50);
    const p10_re = getVal(simResults.RE_runs, 90);
    const mean_re = simResults.RE_runs.reduce((s:number,v:number)=>s+v, 0)/simResults.RE_runs.length;

    const p90_ip = getVal(simResults.inPlaceRuns, 10);
    const p50_ip = getVal(simResults.inPlaceRuns, 50);
    const p10_ip = getVal(simResults.inPlaceRuns, 90);
    const mean_ip = simResults.inPlaceStats.mean;

    const p90_rec = getVal(simResults.recoverableRuns, 10);
    const p50_rec = getVal(simResults.recoverableRuns, 50);
    const p10_rec = getVal(simResults.recoverableRuns, 90);
    const mean_rec = simResults.recoverableStats.mean;

    const makeCell = (text: string, bold = false) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold })] })] });

    const pRows = [
      new TableRow({
        children: [
          makeCell("Parameter", true),
          makeCell("Unit", true),
          makeCell("P90", true),
          makeCell("P50", true),
          makeCell("P10", true),
          makeCell("Mean Success", true)
        ]
      }),
      new TableRow({ children: [makeCell("Drainage Area"), makeCell("acres"), makeCell(p90_A.toFixed(1)), makeCell(p50_A.toFixed(1)), makeCell(p10_A.toFixed(1)), makeCell(mean_A.toFixed(1))] }),
      new TableRow({ children: [makeCell("Net Pay Thickness"), makeCell("feet"), makeCell(p90_h.toFixed(1)), makeCell(p50_h.toFixed(1)), makeCell(p10_h.toFixed(1)), makeCell(mean_h.toFixed(1))] }),
      new TableRow({ children: [makeCell("Porosity"), makeCell("fraction"), makeCell(p90_phi.toFixed(3)), makeCell(p50_phi.toFixed(3)), makeCell(p10_phi.toFixed(3)), makeCell(mean_phi.toFixed(3))] }),
      new TableRow({ children: [makeCell("Water Saturation"), makeCell("fraction"), makeCell(p90_sw.toFixed(3)), makeCell(p50_sw.toFixed(3)), makeCell(p10_sw.toFixed(3)), makeCell(mean_sw.toFixed(3))] }),
      new TableRow({ children: [makeCell("Recovery Efficiency"), makeCell("fraction"), makeCell(p90_re.toFixed(3)), makeCell(p50_re.toFixed(3)), makeCell(p10_re.toFixed(3)), makeCell(mean_re.toFixed(3))] }),
      new TableRow({ children: [makeCell(`In-Place (${fluidType})`), makeCell(fluidType === 'OIL' ? 'MMbbl' : 'Bcf'), makeCell(formatVal(p90_ip, fluidType)), makeCell(formatVal(p50_ip, fluidType)), makeCell(formatVal(p10_ip, fluidType)), makeCell(formatVal(mean_ip, fluidType))] }),
      new TableRow({ children: [makeCell("Primary Recoverable"), makeCell(fluidType === 'OIL' ? 'MMbbl' : 'Bcf'), makeCell(formatVal(p90_rec, fluidType)), makeCell(formatVal(p50_rec, fluidType)), makeCell(formatVal(p10_rec, fluidType)), makeCell(formatVal(mean_rec, fluidType))] })
    ];

    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: "3. Volumetric Simulation Results", bold: true, size: 28 })]
      }),
      new Table({
        rows: pRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }),
      new Paragraph({ text: "" })
    );
  }

  // 4. Geological Risk
  if (reportGeologicalRisk) {
    const makeCell = (text: string, bold = false) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold })] })] });

    const riskRows = [
      new TableRow({
        children: [makeCell("Geological Factor", true), makeCell("Probability", true)]
      }),
      new TableRow({ children: [makeCell("Source Rock / Charge"), makeCell(`${(riskFactors.source * 100).toFixed(0)}%`)] }),
      new TableRow({ children: [makeCell("Timing & Migration"), makeCell(`${(riskFactors.migration * 100).toFixed(0)}%`)] }),
      new TableRow({ children: [makeCell("Reservoir Quality"), makeCell(`${(riskFactors.reservoir * 100).toFixed(0)}%`)] }),
      new TableRow({ children: [makeCell("Trap Closure / Geometry"), makeCell(`${(riskFactors.closure * 100).toFixed(0)}%`)] }),
      new TableRow({ children: [makeCell("Seal / Containment"), makeCell(`${(riskFactors.containment * 100).toFixed(0)}%`)] }),
      new TableRow({ children: [makeCell("Geological Chance of Success (Pg)", true), makeCell(`${(calculatedPg * 100).toFixed(1)}%`, true)] })
    ];

    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: "4. Geological Risk Assessment", bold: true, size: 28 })]
      }),
      new Table({
        rows: riskRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }),
      new Paragraph({ text: "" })
    );
  }

  // Helper to decode base64 images for docx
  const addDocxImage = (base64Img: string | undefined) => {
    if (!base64Img) return null;
    const base64Data = base64Img.replace(/^data:image\/(png|jpg);base64,/, "");
    const arrayBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    return new ImageRun({
      data: arrayBuffer,
      transformation: {
        width: 550,
        height: 275
      }
    } as any);
  };

  // 5. Probability distribution charts
  if (reportPlots) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: "5. Probability Distribution Plots", bold: true, size: 28 })]
      })
    );

    if (chartImages.primaryExceedance) {
      const imageRun = addDocxImage(chartImages.primaryExceedance);
      if (imageRun) {
        docChildren.push(
          new Paragraph({ children: [new TextRun({ text: "Primary Exceedance Curve (CDF)", bold: true })] }),
          new Paragraph({ children: [imageRun] }),
          new Paragraph({ text: "" })
        );
      }
    }

    if (chartImages.primaryPdf) {
      const imageRun = addDocxImage(chartImages.primaryPdf);
      if (imageRun) {
        docChildren.push(
          new Paragraph({ children: [new TextRun({ text: "Primary Relative Density Curve (PDF)", bold: true })] }),
          new Paragraph({ children: [imageRun] }),
          new Paragraph({ text: "" })
        );
      }
    }

    if (includeSecondary) {
      if (chartImages.secondaryExceedance) {
        const imageRun = addDocxImage(chartImages.secondaryExceedance);
        if (imageRun) {
          docChildren.push(
            new Paragraph({ children: [new TextRun({ text: "Secondary Exceedance Curve (CDF)", bold: true })] }),
            new Paragraph({ children: [imageRun] }),
            new Paragraph({ text: "" })
          );
        }
      }

      if (chartImages.secondaryPdf) {
        const imageRun = addDocxImage(chartImages.secondaryPdf);
        if (imageRun) {
          docChildren.push(
            new Paragraph({ children: [new TextRun({ text: "Secondary Relative Density Curve (PDF)", bold: true })] }),
            new Paragraph({ children: [imageRun] }),
            new Paragraph({ text: "" })
          );
        }
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren
      }
    ]
  });

  return await Packer.toBlob(doc);
}
