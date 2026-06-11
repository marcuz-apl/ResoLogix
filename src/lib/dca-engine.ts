const LM = require('ml-levenberg-marquardt').default || require('ml-levenberg-marquardt');

export type ArpsParams = {
  qi: number; // Initial rate
  di: number; // Initial decline rate (nominal, per day or per month depending on time unit)
  b: number;  // Decline exponent
};

export type Point = {
  t: number; // Time
  q: number; // Rate
};

/**
 * Calculates the Arps flow rate at a given time `t`.
 */
export function arpsRate(t: number, params: ArpsParams): number {
  const { qi, di, b } = params;
  if (qi <= 0) return 0;
  if (t === 0) return qi;
  
  if (b === 0) {
    // Exponential
    return qi * Math.exp(-di * t);
  } else if (Math.abs(b - 1) < 1e-5) {
    // Harmonic
    return qi / (1 + di * t);
  } else {
    // Hyperbolic
    return qi / Math.pow(1 + b * di * t, 1 / b);
  }
}

/**
 * Calculates the cumulative production up to time `t`.
 */
export function arpsCumulative(t: number, params: ArpsParams): number {
  const { qi, di, b } = params;
  if (qi <= 0 || di <= 0) return 0;
  
  if (b === 0) {
    // Exponential: Np = (qi - q(t)) / di
    const q_t = qi * Math.exp(-di * t);
    return (qi - q_t) / di;
  } else if (Math.abs(b - 1) < 1e-5) {
    // Harmonic: Np = (qi / di) * ln(qi / q(t))
    const q_t = qi / (1 + di * t);
    return (qi / di) * Math.log(qi / q_t);
  } else {
    // Hyperbolic: Np = (qi^b) / ((1-b)*di) * (qi^(1-b) - q(t)^(1-b))
    const q_t = qi / Math.pow(1 + b * di * t, 1 / b);
    return (Math.pow(qi, b) / ((1 - b) * di)) * (Math.pow(qi, 1 - b) - Math.pow(q_t, 1 - b));
  }
}

/**
 * Automatically fits the historical data to an Arps decline curve using Levenberg-Marquardt.
 * @param data Array of historical data points {t, q}
 * @returns Best-fit Arps parameters {qi, di, b}
 */
export function fitDeclineCurve(data: Point[]): ArpsParams {
  if (data.length < 3) {
    throw new Error('Not enough data points to fit a decline curve.');
  }

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
    const result = LM({ x: tData, y: qData }, arpsFunction, options);
    const [qi, di, b] = result.parameterValues;
    return { qi, di, b };
  } catch (error) {
    console.warn("LM fitting failed, falling back to initial guess", error);
    return { qi: initialGuess[0], di: initialGuess[1], b: initialGuess[2] };
  }
}
