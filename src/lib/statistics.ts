// Statistics and Monte Carlo engine for ResoLogix

export type DistributionType = 'LOGNORMAL' | 'NORMAL' | 'UNIFORM' | 'BETA' | 'TRIANGULAR';

export interface ParameterConfig {
  p90: number;
  p10: number;
  distribution: DistributionType;
}

export interface SimulationParams {
  A: ParameterConfig;
  h: ParameterConfig;
  Phi: ParameterConfig;
  Sw: ParameterConfig;
  Boi: ParameterConfig; // Or Bgi for gas
  RE: ParameterConfig;
  
  // Secondary product parameters (optional)
  GOR?: ParameterConfig;       // Gas-Oil Ratio (scf/STB)
  RE_SolGas?: ParameterConfig; // RE for Solution Gas
  CGR?: ParameterConfig;       // Condensate-Gas Ratio (bbl/MMscf)
  RE_Cond?: ParameterConfig;   // RE for Condensate
}

export interface RiskFactors {
  source: number;
  migration: number;
  reservoir: number;
  closure: number;
  containment: number;
}

export interface SummaryStats {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  p90: number;
  p50: number;
  p10: number;
}

export interface SimulationResults {
  inPlaceStats: SummaryStats;
  recoverableStats: SummaryStats;
  riskedInPlaceStats: SummaryStats;
  riskedRecoverableStats: SummaryStats;
  
  // Secondary product stats
  secInPlaceStats?: SummaryStats;
  secRecoverableStats?: SummaryStats;
  secRiskedInPlaceStats?: SummaryStats;
  secRiskedRecoverableStats?: SummaryStats;

  inPlaceRuns: number[];
  recoverableRuns: number[];
  riskedInPlaceRuns: number[];
  riskedRecoverableRuns: number[];

  secInPlaceRuns?: number[];
  secRecoverableRuns?: number[];
  secRiskedInPlaceRuns?: number[];
  secRiskedRecoverableRuns?: number[];

  // Parameter runs for tables
  A_runs: number[];
  h_runs: number[];
  Phi_runs: number[];
  Sw_runs: number[];
  Boi_runs: number[];
  RE_runs: number[];
  secRE_runs: number[];
  totalBOE_runs: number[];

  pg: number; // Geological Chance of Success (0-1)
}

// Generate a standard normal random variable using Box-Muller transform
export function boxMuller(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Convert P90 and P10 to distribution parameters
export function getDistributionParams(
  p90: number,
  p10: number,
  distType: DistributionType
): { param1: number; param2: number; param3?: number } {
  // Enforce p10 > p90. If they are equal or reversed, handle gracefully.
  let low = Math.min(p90, p10);
  let high = Math.max(p90, p10);
  if (low === high) {
    high = low + 0.001; // Avoid divide-by-zero or flat distributions
  }

  // standard normal Z-score for P90 (10th percentile in standard statistics CDF) is -1.28155156
  // Z-score for P10 (90th percentile in standard statistics CDF) is 1.28155156
  const zScore = 1.28155156;

  switch (distType) {
    case 'LOGNORMAL': {
      // Avoid log of zero or negative numbers
      const safeLow = Math.max(1e-6, low);
      const safeHigh = Math.max(1e-5, high);
      
      const lnP90 = Math.log(safeLow);
      const lnP10 = Math.log(safeHigh);
      
      const mu = (lnP90 + lnP10) / 2;
      const sigma = (lnP10 - lnP90) / (2 * zScore);
      return { param1: mu, param2: sigma };
    }
    case 'NORMAL': {
      const mu = (low + high) / 2;
      const sigma = (high - low) / (2 * zScore);
      return { param1: mu, param2: sigma };
    }
    case 'UNIFORM': {
      const range = 1.25 * (high - low);
      const b = high + 0.10 * range;
      const a = b - range;
      return { param1: a, param2: b };
    }
    case 'BETA': {
      const range = 1.84209 * (high - low);
      const b = high + 0.22857 * range;
      const a = b - range;
      return { param1: a, param2: b };
    }
    case 'TRIANGULAR': {
      const range = 1.80895 * (high - low);
      const b = high + 0.22361 * range;
      const a = b - range;
      const c = (a + b) / 2;
      return { param1: a, param2: b, param3: c };
    }
  }
}

// Sample a single value from a distribution with its computed parameters
export function sampleDistribution(
  distType: DistributionType,
  param1: number,
  param2: number,
  param3?: number,
  physicalMin = 0,
  physicalMax = Infinity
): number {
  let val = 0;
  
  // To avoid extreme outlier loops, limit attempts to 10
  for (let attempt = 0; attempt < 10; attempt++) {
    if (distType === 'LOGNORMAL') {
      const z = boxMuller();
      val = Math.exp(param1 + param2 * z);
    } else if (distType === 'NORMAL') {
      const z = boxMuller();
      val = param1 + param2 * z;
    } else if (distType === 'UNIFORM') {
      const u = Math.random();
      val = param1 + (param2 - param1) * u;
    } else if (distType === 'BETA') {
      const u1 = Math.random();
      const u2 = Math.random();
      const u3 = Math.random();
      const median = u1 + u2 + u3 - Math.min(u1, u2, u3) - Math.max(u1, u2, u3);
      val = param1 + (param2 - param1) * median;
    } else if (distType === 'TRIANGULAR') {
      const u = Math.random();
      const a = param1;
      const b = param2;
      const c = param3 ?? (a + b) / 2;
      
      const threshold = (c - a) / (b - a);
      if (u < threshold) {
        val = a + Math.sqrt(u * (b - a) * (c - a));
      } else {
        val = b - Math.sqrt((1 - u) * (b - a) * (b - c));
      }
    }

    if (val >= physicalMin && val <= physicalMax) {
      return val;
    }
  }
  
  return Math.max(physicalMin, Math.min(physicalMax, val));
}

// Calculate percentile
export function getPercentile(sortedArr: number[], pct: number): number {
  if (sortedArr.length === 0) return 0;
  
  const index = (pct / 100) * (sortedArr.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
}

// Calculate Summary Statistics
export function calculateStats(runs: number[]): SummaryStats {
  if (runs.length === 0) {
    return { mean: 0, stdDev: 0, min: 0, max: 0, p90: 0, p50: 0, p10: 0 };
  }
  
  const sorted = [...runs].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  
  const sqDiffSum = sorted.reduce((a, b) => a + Math.pow(b - mean, 2), 0);
  const variance = sqDiffSum / sorted.length;
  const stdDev = Math.sqrt(variance);
  
  const p90 = getPercentile(sorted, 10);
  const p50 = getPercentile(sorted, 50);
  const p10 = getPercentile(sorted, 90);
  
  return { mean, stdDev, min, max, p90, p50, p10 };
}

// Run Monte Carlo Simulation
export function runMonteCarlo(
  fluidType: 'OIL' | 'GAS',
  params: SimulationParams,
  risk: RiskFactors,
  iterations = 10000,
  includeSecondary = true
): SimulationResults {
  // Setup default secondary configs if not provided
  const safeGOR = params.GOR || { p90: 600, p10: 1200, distribution: 'LOGNORMAL' };
  const safeRE_SolGas = params.RE_SolGas || { p90: 0.20, p10: 0.40, distribution: 'LOGNORMAL' };
  const safeCGR = params.CGR || { p90: 20, p10: 60, distribution: 'LOGNORMAL' };
  const safeRE_Cond = params.RE_Cond || { p90: 0.25, p10: 0.45, distribution: 'LOGNORMAL' };

  // Pre-calculate distribution parameters
  const distParams = {
    A: getDistributionParams(params.A.p90, params.A.p10, params.A.distribution),
    h: getDistributionParams(params.h.p90, params.h.p10, params.h.distribution),
    Phi: getDistributionParams(params.Phi.p90, params.Phi.p10, params.Phi.distribution),
    Sw: getDistributionParams(params.Sw.p90, params.Sw.p10, params.Sw.distribution),
    Boi: getDistributionParams(params.Boi.p90, params.Boi.p10, params.Boi.distribution),
    RE: getDistributionParams(params.RE.p90, params.RE.p10, params.RE.distribution),
    
    // Secondary parameters
    GOR: getDistributionParams(safeGOR.p90, safeGOR.p10, safeGOR.distribution),
    RE_SolGas: getDistributionParams(safeRE_SolGas.p90, safeRE_SolGas.p10, safeRE_SolGas.distribution),
    CGR: getDistributionParams(safeCGR.p90, safeCGR.p10, safeCGR.distribution),
    RE_Cond: getDistributionParams(safeRE_Cond.p90, safeRE_Cond.p10, safeRE_Cond.distribution),
  };

  const inPlaceRuns: number[] = [];
  const recoverableRuns: number[] = [];
  const riskedInPlaceRuns: number[] = [];
  const riskedRecoverableRuns: number[] = [];

  // Secondary product runs
  const secInPlaceRuns: number[] = [];
  const secRecoverableRuns: number[] = [];
  const secRiskedInPlaceRuns: number[] = [];
  const secRiskedRecoverableRuns: number[] = [];

  // Parameter runs for tables
  const A_runs: number[] = [];
  const h_runs: number[] = [];
  const Phi_runs: number[] = [];
  const Sw_runs: number[] = [];
  const Boi_runs: number[] = [];
  const RE_runs: number[] = [];
  const secRE_runs: number[] = [];
  const totalBOE_runs: number[] = [];

  // Geological Chance of Success
  const Pg = risk.source * risk.migration * risk.reservoir * risk.closure * risk.containment;

  const constantMultiplier = fluidType === 'OIL' ? 7758 : 43560;

  for (let i = 0; i < iterations; i++) {
    // Sample parameters with physical constraints
    const A_val = sampleDistribution(params.A.distribution, distParams.A.param1, distParams.A.param2, distParams.A.param3, 0.001, Infinity);
    const h_val = sampleDistribution(params.h.distribution, distParams.h.param1, distParams.h.param2, distParams.h.param3, 0.001, Infinity);
    const Phi_val = sampleDistribution(params.Phi.distribution, distParams.Phi.param1, distParams.Phi.param2, distParams.Phi.param3, 0.0, 1.0);
    const Sw_val = sampleDistribution(params.Sw.distribution, distParams.Sw.param1, distParams.Sw.param2, distParams.Sw.param3, 0.0, 1.0);
    const Boi_val = sampleDistribution(params.Boi.distribution, distParams.Boi.param1, distParams.Boi.param2, distParams.Boi.param3, 0.001, Infinity);
    const RE_val = sampleDistribution(params.RE.distribution, distParams.RE.param1, distParams.RE.param2, distParams.RE.param3, 0.0, 1.0);

    // Calculate Primary In-Place Volume (OOIP or OGIP)
    // For OIL: divided by Boi
    // For GAS: multiplied by GEF
    const inPlace = fluidType === 'OIL'
      ? (7758 * A_val * h_val * Phi_val * (1 - Sw_val)) / Boi_val
      : (43560 * A_val * h_val * Phi_val * (1 - Sw_val)) * Boi_val;
    const recoverable = inPlace * RE_val;

    inPlaceRuns.push(inPlace);
    recoverableRuns.push(recoverable);

    riskedInPlaceRuns.push(inPlace * Pg);
    riskedRecoverableRuns.push(recoverable * Pg);

    // Push parameters
    A_runs.push(A_val);
    h_runs.push(h_val);
    Phi_runs.push(Phi_val);
    Sw_runs.push(Sw_val);
    Boi_runs.push(Boi_val);
    RE_runs.push(RE_val);

    // Secondary calculations
    if (includeSecondary) {
      if (fluidType === 'OIL') {
        // Oil + Solution Gas
        const GOR_val = sampleDistribution(safeGOR.distribution, distParams.GOR.param1, distParams.GOR.param2, distParams.GOR.param3, 0.001, Infinity);
        const RE_SolGas_val = sampleDistribution(safeRE_SolGas.distribution, distParams.RE_SolGas.param1, distParams.RE_SolGas.param2, distParams.RE_SolGas.param3, 0.0, 1.0);

        // Gas In Place = OOIP * GOR (scf)
        const secInPlace = inPlace * GOR_val;
        // Recoverable Solution Gas = Gas In Place * RE_SolGas (scf)
        const secRecoverable = secInPlace * RE_SolGas_val;

        secInPlaceRuns.push(secInPlace);
        secRecoverableRuns.push(secRecoverable);
        secRiskedInPlaceRuns.push(secInPlace * Pg);
        secRiskedRecoverableRuns.push(secRecoverable * Pg);

        secRE_runs.push(RE_SolGas_val);
        // Total BOE: Recoverable Oil (MMbbl) + Recoverable Solution Gas (Bcf) / 6
        const totalBOE = (recoverable / 1e6) + (secRecoverable / 1e9) / 6.0;
        totalBOE_runs.push(totalBOE);
      } else {
        // Gas + Condensate
        const CGR_val = sampleDistribution(safeCGR.distribution, distParams.CGR.param1, distParams.CGR.param2, distParams.CGR.param3, 0.001, Infinity);
        const RE_Cond_val = sampleDistribution(safeRE_Cond.distribution, distParams.RE_Cond.param1, distParams.RE_Cond.param2, distParams.RE_Cond.param3, 0.0, 1.0);

        // Condensate In-Place = OGIP * (CGR / 10^6) (bbl)
        const secInPlace = inPlace * (CGR_val / 1e6);
        // Recoverable Condensate = Condensate In-Place * RE_Cond (bbl)
        const secRecoverable = secInPlace * RE_Cond_val;

        secInPlaceRuns.push(secInPlace);
        secRecoverableRuns.push(secRecoverable);
        secRiskedInPlaceRuns.push(secInPlace * Pg);
        secRiskedRecoverableRuns.push(secRecoverable * Pg);

        secRE_runs.push(RE_Cond_val);
        // Total BOE: Recoverable Gas (Bcf) / 6 + Recoverable Condensate (MMbbl)
        const totalBOE = (recoverable / 1e9) / 6.0 + (secRecoverable / 1e6);
        totalBOE_runs.push(totalBOE);
      }
    } else {
      // Secondary disabled
      secInPlaceRuns.push(0);
      secRecoverableRuns.push(0);
      secRiskedInPlaceRuns.push(0);
      secRiskedRecoverableRuns.push(0);
      secRE_runs.push(0);

      // Total BOE without secondary product
      const totalBOE = fluidType === 'OIL'
        ? (recoverable / 1e6)
        : (recoverable / 1e9) / 6.0;
      totalBOE_runs.push(totalBOE);
    }
  }

  return {
    inPlaceStats: calculateStats(inPlaceRuns),
    recoverableStats: calculateStats(recoverableRuns),
    riskedInPlaceStats: calculateStats(riskedInPlaceRuns),
    riskedRecoverableStats: calculateStats(riskedRecoverableRuns),
    
    // Secondary Stats
    secInPlaceStats: calculateStats(secInPlaceRuns),
    secRecoverableStats: calculateStats(secRecoverableRuns),
    secRiskedInPlaceStats: calculateStats(secRiskedInPlaceRuns),
    secRiskedRecoverableStats: calculateStats(secRiskedRecoverableRuns),

    inPlaceRuns,
    recoverableRuns,
    riskedInPlaceRuns,
    riskedRecoverableRuns,

    secInPlaceRuns,
    secRecoverableRuns,
    secRiskedInPlaceRuns,
    secRiskedRecoverableRuns,

    A_runs,
    h_runs,
    Phi_runs,
    Sw_runs,
    Boi_runs,
    RE_runs,
    secRE_runs,
    totalBOE_runs,

    pg: Pg,
  };
}

// Prepare data for Histogram plotting
export function generateHistogramData(runs: number[], binCount = 30) {
  if (runs.length === 0) return { labels: [], data: [] };
  
  const min = Math.min(...runs);
  const max = Math.max(...runs);
  const range = max - min;
  const binWidth = range / binCount;
  
  const bins = new Array(binCount).fill(0);
  const binCenters = new Array(binCount).fill(0);
  
  for (let i = 0; i < binCount; i++) {
    binCenters[i] = min + (i + 0.5) * binWidth;
  }
  
  for (const val of runs) {
    let binIdx = Math.floor((val - min) / binWidth);
    if (binIdx >= binCount) binIdx = binCount - 1;
    if (binIdx < 0) binIdx = 0;
    bins[binIdx]++;
  }
  
  const total = runs.length;
  const pdfValues = bins.map(count => count / (total * binWidth));
  const relativeFreq = bins.map(count => (count / total) * 100);
  
  return {
    labels: binCenters.map(c => Number(c.toFixed(2))),
    pdf: pdfValues,
    percentages: relativeFreq,
    counts: bins,
  };
}

// Prepare data for Exceedance Curve plotting (1 - CDF)
export function generateExceedanceData(runs: number[], sampleCount = 100) {
  if (runs.length === 0) return { labels: [], data: [] };
  
  const sorted = [...runs].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;
  
  const labels: number[] = [];
  const exceedanceProbabilities: number[] = [];
  
  for (let i = 0; i <= sampleCount; i++) {
    const threshold = min + (i / sampleCount) * range;
    labels.push(Number(threshold.toFixed(2)));
    
    let countGE = 0;
    for (let j = sorted.length - 1; j >= 0; j--) {
      if (sorted[j] >= threshold) {
        countGE++;
      } else {
        break;
      }
    }
    const prob = (countGE / sorted.length) * 100;
    exceedanceProbabilities.push(Number(prob.toFixed(1)));
  }
  
  return {
    labels,
    data: exceedanceProbabilities,
  };
}
