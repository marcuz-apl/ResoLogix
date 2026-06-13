import ExcelJS from 'exceljs';
import path from 'path';

export const generateExcel = async (reportsDir: string, data: any, contents: any, activeName: string) => {
  const workbook = new ExcelJS.Workbook();
  const safeName = activeName ? activeName.replace(/[^a-zA-Z0-9-]/g, '_') : 'Evaluation';
  workbook.creator = 'ResoLogix';
  workbook.created = new Date();

  // Results
  if (contents.results && data.tableData) {
    // Sheet 1: Results (Landscape layout)
    const resultsSheet = workbook.addWorksheet('Evaluation Results', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    const primaryInPlaceLabel = data.fluidType === 'OIL' ? 'OOIP' : 'OGIP';
    const primaryUnit = data.fluidType === 'OIL' ? 'MMSTB' : 'BCF';
    const secUnit = data.fluidType === 'OIL' ? 'BCF' : 'MMSTB';

    // Add headers
    const columns = [
      { header: 'PROB', key: 'prob', width: 10 },
      { header: 'Area (Acre)', key: 'Area', width: 15 },
      { header: 'Net Pay (feet)', key: 'h', width: 15 },
      { header: 'Porosity (frac)', key: 'Phi', width: 15 },
      { header: 'Sw (frac)', key: 'Sw', width: 12 },
      { header: data.fluidType === 'OIL' ? 'Bo (bbl/STB)' : 'Bg (bbl/SCF)', key: 'Boi', width: 15 },
      { header: 'Pri RE (frac)', key: 'RE', width: 18 },
      { header: 'Sec RE (frac)', key: 'secRE', width: 18 },
      { header: `${primaryInPlaceLabel} (${data.fluidType === 'OIL' ? 'MMbbl' : 'BCF'})`, key: 'primaryInPlace', width: 18 },
      { header: `Pri Yield (${primaryUnit})`, key: 'primaryLiquid', width: 22 },
      { header: `Secondary Yield (${secUnit})`, key: 'secondaryFluid', width: 22 },
      { header: 'Total Yield (MMBOE)', key: 'totalBOE', width: 20 }
    ];
    resultsSheet.columns = columns;

    // Add data
    data.tableData.forEach((row: any) => {
      resultsSheet.addRow(row);
    });

    // Styling
    resultsSheet.getRow(1).font = { bold: true };
    resultsSheet.getRow(1).alignment = { horizontal: 'center' };

    // Sheet 2: Results (Transposed layout)
    const transposedSheet = workbook.addWorksheet('Results (Transposed)', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    const headers = ['Parameter', ...data.tableData.map((r: any) => r.prob)];
    transposedSheet.addRow(headers);
    transposedSheet.getRow(1).font = { bold: true };

    const keysToTranspose = columns.filter(c => c.key !== 'prob');
    keysToTranspose.forEach(col => {
      const row = [col.header];
      data.tableData.forEach((d: any) => {
        row.push(d[col.key!]);
      });
      transposedSheet.addRow(row);
    });
  }

  // Geological Risk
  if (contents.risk && data.riskFactors) {
    const riskSheet = workbook.addWorksheet('Geological Risk', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    riskSheet.columns = [
      { header: 'RISK FACTOR', key: 'factor', width: 25 },
      { header: 'PROB', key: 'prob', width: 15 }
    ];

    riskSheet.addRow({ factor: 'Source', prob: data.riskFactors.source });
    riskSheet.addRow({ factor: 'Timing / Migration', prob: data.riskFactors.migration });
    riskSheet.addRow({ factor: 'Reservoir Quality', prob: data.riskFactors.reservoir });
    riskSheet.addRow({ factor: 'Closures', prob: data.riskFactors.closure });
    riskSheet.addRow({ factor: 'Containment / Seal', prob: data.riskFactors.containment });
    riskSheet.addRow({ factor: 'Chance of Success (Pg)', prob: data.calculatedPg });

    riskSheet.getRow(1).font = { bold: true };
  }

  // Resource Profile
  if (contents.profile && data.profileData) {
    const profileSheet = workbook.addWorksheet('Resource Profile', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    profileSheet.columns = [
      { header: 'PARAMETER', key: 'param', width: 25 },
      { header: 'VALUE', key: 'value', width: 30 }
    ];

    profileSheet.addRow({ param: 'Country', value: data.profileData.country });
    profileSheet.addRow({ param: 'Geological Basin', value: data.profileData.geolBasin });
    profileSheet.addRow({ param: 'Play Type', value: data.profileData.playType });
    profileSheet.addRow({ param: 'Reservoir Age', value: data.profileData.reservoirAge });
    profileSheet.addRow({ param: 'Lithology', value: data.profileData.lithology });
    profileSheet.addRow({ param: 'Depositional Environment', value: data.profileData.depoEnv });
    profileSheet.addRow({ param: 'Exploration Stage', value: data.profileData.expStage });
    profileSheet.addRow({ param: 'Terrain / Depth', value: data.profileData.terrain });
    profileSheet.addRow({ param: 'Lahee Class', value: data.profileData.laheeClass });
    profileSheet.addRow({ param: 'Type Well', value: data.profileData.typeWell });

    profileSheet.getRow(1).font = { bold: true };
  }

  // Petroleum Economics & EMV
  if (contents.economics && data.econParams && data.emvParams) {
    const econSheet = workbook.addWorksheet('Economics & EMV', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    econSheet.columns = [
      { header: 'METRIC', key: 'metric', width: 30 },
      { header: 'VALUE', key: 'value', width: 20 }
    ];

    const pvSuccess = (0.3 * data.emvParams.npv90) + (0.4 * data.emvParams.npv50) + (0.3 * data.emvParams.npv10);
    const emv = (pvSuccess * data.calculatedPg) - (data.emvParams.dryHoleCost * (1 - data.calculatedPg));

    econSheet.addRow({ metric: 'Oil Price ($/bbl)', value: data.econParams.oilPrice });
    econSheet.addRow({ metric: 'Gas Price ($/Mcf)', value: data.econParams.gasPrice });
    econSheet.addRow({ metric: 'OPEX ($/boe)', value: data.econParams.opex });
    econSheet.addRow({ metric: 'Initial CapEx ($MM)', value: data.emvParams.dryHoleCost });
    econSheet.addRow({ metric: 'Discount Rate (%)', value: data.econParams.discountRate });
    econSheet.addRow({ metric: 'Project Life (Years)', value: data.econParams.projectLife });
    econSheet.addRow({ metric: 'Annual Decline (%)', value: data.econParams.declineRate });
    econSheet.addRow({ metric: 'P90 NPV ($MM)', value: data.emvParams.npv90 });
    econSheet.addRow({ metric: 'P50 NPV ($MM)', value: data.emvParams.npv50 });
    econSheet.addRow({ metric: 'P10 NPV ($MM)', value: data.emvParams.npv10 });
    econSheet.addRow({ metric: 'Mean PV of Success ($MM)', value: pvSuccess });
    econSheet.addRow({ metric: 'Expected Monetary Value ($MM)', value: emv });

    econSheet.getRow(1).font = { bold: true };
  }

  const outputPath = path.join(reportsDir, `${safeName}_Report.xlsx`);
  await workbook.xlsx.writeFile(outputPath);
};
