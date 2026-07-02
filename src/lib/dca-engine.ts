// ml-levenberg-marquardt is imported dynamically inside fitDeclineCurve to avoid SSR/bundling issues.

export type ArpsParams = {
  qi: number; // Initial rate
  di: number; // Initial decline rate (nominal, per day or per month depending on time unit)
  b: number;  // Decline exponent
  d_min?: number; // Terminal decline rate (nominal, per month if t is in months)
};

export type MethodParams = {
  // Arps
  qi?: number;
  di?: number;
  b?: number;
  d_min?: number;
  // Duong
  q1?: number;
  a?: number;
  m?: number;
  // SEPD
  tau?: number;
  n?: number;
  // PLE
  d_inf?: number;
  d_i_hat?: number;
};

export type DcaMethod = 'ARPS' | 'DUONG' | 'SEPD' | 'PLE';

export type Point = {
  t: number; // Time
  q: number; // Rate
};

/**
 * Calculates the Arps flow rate at a given time `t`.
 */
export function arpsRate(t: number, params: ArpsParams): number {
  const { qi, di, b, d_min } = params;
  if (qi <= 0) return 0;
  if (t === 0) return qi;
  
  if (b === 0) {
    // Exponential
    return qi * Math.exp(-di * t);
  } else if (Math.abs(b - 1) < 1e-5) {
    // Harmonic
    let q_t = qi / (1 + di * t);
    if (d_min && d_min > 0) {
      const D_t = di / (1 + di * t);
      if (D_t < d_min) {
        const t_switch = (di / d_min - 1) / di;
        const q_switch = qi / (1 + di * t_switch);
        q_t = q_switch * Math.exp(-d_min * (t - t_switch));
      }
    }
    return q_t;
  } else {
    // Hyperbolic
    let q_t = qi / Math.pow(1 + b * di * t, 1 / b);
    if (d_min && d_min > 0) {
      const D_t = di / (1 + b * di * t);
      if (D_t < d_min) {
        const t_switch = (di / d_min - 1) / (b * di);
        const q_switch = qi / Math.pow(1 + b * di * t_switch, 1 / b);
        q_t = q_switch * Math.exp(-d_min * (t - t_switch));
      }
    }
    return q_t;
  }
}

/**
 * Calculates the cumulative production up to time `t`.
 */
export function arpsCumulative(t: number, params: ArpsParams): number {
  const { qi, di, b, d_min } = params;
  if (qi <= 0 || di <= 0) return 0;
  
  if (b === 0) {
    // Exponential: Np = (qi - q(t)) / di
    const q_t = qi * Math.exp(-di * t);
    return (qi - q_t) / di;
  } else if (Math.abs(b - 1) < 1e-5) {
    // Harmonic: Np = (qi / di) * ln(qi / q(t))
    let Np = 0;
    let t_switch = t;
    if (d_min && d_min > 0) {
      const switchTime = (di / d_min - 1) / di;
      if (switchTime < t) {
        t_switch = switchTime;
        const q_switch = qi / (1 + di * t_switch);
        const q_t = q_switch * Math.exp(-d_min * (t - t_switch));
        Np += (q_switch - q_t) / d_min; // Exponential tail
      }
    }
    const q_switch = qi / (1 + di * t_switch);
    Np += (qi / di) * Math.log(qi / q_switch);
    return Np;
  } else {
    // Hyperbolic: Np = (qi^b) / ((1-b)*di) * (qi^(1-b) - q(t)^(1-b))
    let Np = 0;
    let t_switch = t;
    if (d_min && d_min > 0) {
      const switchTime = (di / d_min - 1) / (b * di);
      if (switchTime < t) {
        t_switch = switchTime;
        const q_switch = qi / Math.pow(1 + b * di * t_switch, 1 / b);
        const q_t = q_switch * Math.exp(-d_min * (t - t_switch));
        Np += (q_switch - q_t) / d_min; // Exponential tail
      }
    }
    const q_switch = qi / Math.pow(1 + b * di * t_switch, 1 / b);
    Np += (Math.pow(qi, b) / ((1 - b) * di)) * (Math.pow(qi, 1 - b) - Math.pow(q_switch, 1 - b));
    return Np;
  }
}

/**
 * Automatically fits the historical data to an Arps decline curve using Levenberg-Marquardt.
 * @param data Array of historical data points {t, q}
 * @returns Best-fit Arps parameters {qi, di, b}
 */
export async function fitDeclineCurve(data: Point[]): Promise<ArpsParams> {
  if (data.length < 3) {
    throw new Error('Not enough data points to fit a decline curve.');
  }

  const { levenbergMarquardt } = await import('ml-levenberg-marquardt');

  // Define the objective function for LM
  // p = [qi, di, b]
  const arpsFunction = ([qi, di, b]: number[]) => (t: number) => {
    if (b === 0) return qi * Math.exp(-di * t);
    return qi / Math.pow(1 + b * di * t, 1 / b);
  };

  const tData = data.map(d => d.t);
  const qData = data.map(d => d.q);

  // Guess initial parameters based on data
  const qMax = Math.max(...qData);
  const initialGuess = [qMax, 0.1, 0.5]; // [qi, di, b]

  const options = {
    damping: 1.5,
    initialValues: initialGuess,
    minValues: [0, 0, 0],   // qi >= 0, di >= 0, b >= 0
    maxValues: [qMax * 2, 2, 2], // b usually doesn't exceed 2 in practical DCA
    gradientDifference: 10e-2,
    maxIterations: 1000,
    errorTolerance: 10e-3,
  };

  try {
    const result = levenbergMarquardt({ x: tData, y: qData }, arpsFunction, options);
    const [qi, di, b] = result.parameterValues;
    return { qi, di, b };
  } catch (error) {
    console.warn("LM fitting failed, falling back to initial guess", error);
    return { qi: initialGuess[0], di: initialGuess[1], b: initialGuess[2] };
  }
}

/**
 * Modern Methods: Rate functions
 */

export function duongRate(t: number, params: MethodParams): number {
  const { q1 = 1000, a = 1.1, m = 1.2 } = params;
  if (t <= 0) return q1;
  // q(t) = q1 * t^-m * exp( (a/(1-m)) * (t^(1-m) - 1) )
  if (Math.abs(m - 1) < 1e-5) {
    // Edge case m=1: integral becomes ln(t)
    return q1 * Math.pow(t, -m) * Math.pow(t, a);
  }
  return q1 * Math.pow(t, -m) * Math.exp((a / (1 - m)) * (Math.pow(t, 1 - m) - 1));
}

export function sepdRate(t: number, params: MethodParams): number {
  const { qi = 1000, tau = 10, n = 0.5 } = params;
  if (t <= 0) return qi;
  // q(t) = qi * exp( -(t/tau)^n )
  return qi * Math.exp(-Math.pow(t / tau, n));
}

export function pleRate(t: number, params: MethodParams): number {
  const { qi = 1000, d_inf = 0.01, d_i_hat = 0.5, n = 0.5 } = params;
  if (t <= 0) return qi;
  // q(t) = qi * exp( -d_inf * t - d_i_hat * t^n )
  return qi * Math.exp(-d_inf * t - d_i_hat * Math.pow(t, n));
}

/**
 * Numerical Integration using Simpson's Rule
 */
export function numericalCumulative(t: number, rateFunc: (t: number) => number, steps: number = 1000): number {
  if (t <= 0) return 0;
  const h = t / steps;
  let sum = rateFunc(0) + rateFunc(t);
  
  for (let i = 1; i < steps; i++) {
    const x = i * h;
    sum += rateFunc(x) * (i % 2 === 0 ? 2 : 4);
  }
  
  return (sum * h) / 3;
}

/**
 * Unified Method Wrapper
 */
export function calculateDcaRate(t: number, method: DcaMethod, params: MethodParams): number {
  switch (method) {
    case 'DUONG': return duongRate(t, params);
    case 'SEPD': return sepdRate(t, params);
    case 'PLE': return pleRate(t, params);
    case 'ARPS':
    default:
      return arpsRate(t, { 
        qi: params.qi ?? 1000, 
        di: params.di ?? 0.1, 
        b: params.b ?? 0.5, 
        d_min: params.d_min 
      });
  }
}

export function calculateDcaCumulative(t: number, method: DcaMethod, params: MethodParams): number {
  switch (method) {
    case 'DUONG':
      return numericalCumulative(t, (x) => duongRate(x, params));
    case 'SEPD':
      return numericalCumulative(t, (x) => sepdRate(x, params));
    case 'PLE':
      return numericalCumulative(t, (x) => pleRate(x, params));
    case 'ARPS':
    default:
      return arpsCumulative(t, { 
        qi: params.qi ?? 1000, 
        di: params.di ?? 0.1, 
        b: params.b ?? 0.5, 
        d_min: params.d_min 
      });
  }
}

/**
 * Finds the time when rate drops to qLimit
 */
export function findTimeLimit(qLimit: number, method: DcaMethod, params: MethodParams, maxTime: number = 10000): number {
  if (qLimit <= 0) return maxTime;
  
  // Fast analytical solve for ARPS
  if (method === 'ARPS') {
    const qi = params.qi ?? 1000;
    const di = params.di ?? 0.1;
    const b = params.b ?? 0.5;
    
    if (qi <= qLimit || di <= 0) return 0;
    if (b === 0) return Math.log(qi / qLimit) / di;
    return (Math.pow(qi / qLimit, b) - 1) / (b * di);
  }

  // Numerical solve (Bisection method) for others
  let tLow = 0;
  let tHigh = maxTime;
  
  // Check if initial rate is already below limit
  if (calculateDcaRate(tLow, method, params) <= qLimit) return 0;
  
  // Check if it never reaches limit within maxTime
  if (calculateDcaRate(tHigh, method, params) > qLimit) return maxTime;

  // Bisection loop
  for (let i = 0; i < 50; i++) {
    const tMid = (tLow + tHigh) / 2;
    const qMid = calculateDcaRate(tMid, method, params);
    
    if (Math.abs(qMid - qLimit) < 1e-3) return tMid;
    
    if (qMid > qLimit) {
      tLow = tMid; // Rate is still too high, search later
    } else {
      tHigh = tMid; // Rate is too low, search earlier
    }
  }
  
  return (tLow + tHigh) / 2;
}
