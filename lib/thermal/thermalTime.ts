import {
  CWB_DEFAULT_HISTORY,
  CWB_ROWS_PER_YEAR_DEFAULT,
  type CwbFetchOptions,
  type CwbParseOptions,
  fetchCwbCsv,
  inferYearCountFromFilteredRows,
  parseCsvRows,
} from "./cwb";

function isClose(a: number, b = 0, eps = 1e-9): boolean {
  return Math.abs(a - b) < eps;
}

/** Year × month × day grid from filtered COA rows. */
function dataMatrixFromFilteredRows(
  df: string[][],
  numYears: number,
  rowsPerYear: number
): number[][][] {
  const maxRow = rowsPerYear * (numYears - 1) + 30 + 1;
  if (df.length <= maxRow) {
    throw new Error(
      `Weather CSV is too short: need at least ${maxRow + 1} data rows after filtering ` +
        `(${numYears} years × ${rowsPerYear} rows/year layout). Got ${df.length}.`
    );
  }

  const data: number[][][] = Array.from({ length: numYears }, () =>
    Array.from({ length: 12 }, () => Array(31).fill(0))
  );
  for (let yi = 0; yi < numYears; yi++) {
    for (let mi = 0; mi < 12; mi++) {
      for (let di = 0; di < 31; di++) {
        const rowIdx = rowsPerYear * yi + di + 1;
        let raw = df[rowIdx]?.[mi + 1];
        if (raw === "/" || raw === "" || raw === undefined) raw = "0.";
        data[yi]![mi]![di] = parseFloat(raw);
      }
    }
  }
  return data;
}

function meanOverYears(data: number[][][]): number[][] {
  const numYears = data.length;
  const dataMean: number[][] = Array.from({ length: 12 }, () => Array(31).fill(0));
  for (let mi = 0; mi < 12; mi++) {
    for (let di = 0; di < 31; di++) {
      let count = 0;
      let sum = 0;
      for (let yi = 0; yi < numYears; yi++) {
        if (!isClose(data[yi]![mi]![di]!, 0)) {
          count += 1;
          sum += data[yi]![mi]![di]!;
        }
      }
      if (count !== 0) dataMean[mi]![di] = sum / count;
    }
  }
  return dataMean;
}

function mgddFromMeans(tMax: number[][], tMin: number[][], tb: number): number[] {
  const mgdd: number[] = [];
  for (let mi = 0; mi < 12; mi++) {
    for (let di = 0; di < 31; di++) {
      if (isClose(tMax[mi]![di]!, 0)) continue;
      if (mi === 1 && di === 28) continue;
      let tmax = tMax[mi]![di]!;
      if (tmax > 30) tmax = 30;
      let tmin = tMin[mi]![di]!;
      if (tmin < tb) tmin = tb;
      const T = (tmax + tmin) / 2;
      mgdd.push(T - tb);
    }
  }
  return mgdd;
}

function rotateFromPlantingDate(mgdd: number[], startYear: number, startMonth: number, startDay: number): number[] {
  const jan1 = new Date(startYear, 0, 1);
  const plant = new Date(startYear, startMonth - 1, startDay);
  const deltaDays = Math.round((plant.getTime() - jan1.getTime()) / 86_400_000);
  return [...mgdd.slice(deltaDays), ...mgdd.slice(0, deltaDays)];
}

function cumulativeSum(values: number[]): number[] {
  let t = 0;
  return values.map((v) => {
    t += v;
    return t;
  });
}

/**
 * Map legacy anchor days (0,100,…,364) onto the actual σ length so a different
 * calendar vector length still samples the same relative positions.
 */
function buildInterpolationNodes(sigma: number[]): { x: number[]; y: number[] } {
  const L = sigma.length;
  if (L < 5) {
    throw new Error(`Need at least 5 cumulative σ points; got ${L}.`);
  }

  const legacyDay = [0, 100, 200, 300, 364];
  const scale = (L - 1) / 364;
  const idx = legacyDay.map((d) => Math.round(d * scale));
  idx[0] = 0;
  idx[4] = L - 1;
  for (let i = 1; i < idx.length; i++) {
    if (idx[i]! <= idx[i - 1]!) {
      idx[i] = Math.min(L - 1, idx[i - 1]! + 1);
    }
  }

  const x = idx.map((v) => v);
  const y = idx.map((i) => sigma[i]!);
  return { x, y };
}

function dividedDifferenceTable(x: number[], y: number[]): { f: number[]; n: number } {
  const n = x.length - 1;
  const fdd: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= n; i++) fdd[i]![0] = y[i]!;
  for (let j = 1; j <= n; j++) {
    for (let i = 0; i <= n - j; i++) {
      fdd[i]![j] = (fdd[i + 1]![j - 1]! - fdd[i]![j - 1]!) / (x[i + j]! - x[i]!);
    }
  }
  return { f: fdd[0]!, n };
}

function evalNewtonPoly(n: number, xi: number, x: number[], f: number[]): number {
  const yint = Array(n).fill(0);
  yint[0] = f[0]!;
  let xterm = 1;
  for (let order = 1; order < n; order++) {
    xterm *= xi - x[order - 1]!;
    yint[order] = yint[order - 1]! + f[order]! * xterm;
  }
  return yint[n - 1]!;
}

/** Newton–Raphson with numerical ∂P/∂x — works for any anchor spacing. */
function newtonSolveForTheta(n: number, x: number[], f: number[], theta: number): number {
  let oldX = 1;
  const h = 1e-6;
  const maxIter = 100;

  for (let iter = 0; iter < maxIter; iter++) {
    const p = evalNewtonPoly(n, oldX, x, f) - theta;
    const dp =
      (evalNewtonPoly(n, oldX + h, x, f) - evalNewtonPoly(n, oldX - h, x, f)) / (2 * h);
    if (!Number.isFinite(p) || !Number.isFinite(dp)) {
      throw new Error("Interpolation became non-finite; check temperature inputs and history window.");
    }
    if (Math.abs(dp) < 1e-12) {
      throw new Error("Flat interpolant derivative — try a different θ or weather range.");
    }
    const newX = oldX - p / dp;
    if (!Number.isFinite(newX)) {
      throw new Error("Newton iteration diverged.");
    }
    if (Math.abs((newX - oldX) / Math.max(1e-9, Math.abs(newX))) <= 0.000005) {
      return newX;
    }
    oldX = newX;
  }

  throw new Error("Newton iteration did not converge.");
}

export type ThermalComputeInput = {
  startYear: number;
  startMonth: number;
  startDay: number;
  stationCode: string;
  stationLevelName: string;
  tb: number;
  theta: number;
  /** Optional COA date window + parsing overrides (defaults preserve legacy behaviour). */
  cwb?: CwbFetchOptions;
};

export type ThermalComputeMeta = {
  historyStart: string;
  historyEnd: string;
  yearsAveraged: number;
  rowsPerYear: number;
  filteredRowCount: number;
  sigmaLength: number;
};

export type ThermalComputeResult = {
  harvestDate: string;
  cumulativeDegreeDays: number[];
  estimatedDays: number;
  meta: ThermalComputeMeta;
};

export async function computeThermalHarvest(input: ThermalComputeInput): Promise<ThermalComputeResult> {
  const {
    stationCode,
    stationLevelName,
    tb,
    theta,
    startYear,
    startMonth,
    startDay,
    cwb,
  } = input;

  const history = cwb?.history ?? CWB_DEFAULT_HISTORY;
  const parseOpts: CwbParseOptions | undefined = cwb?.parse;
  const rowsPerYear = parseOpts?.rowsPerYear ?? CWB_ROWS_PER_YEAR_DEFAULT;

  const [maxCsv, minCsv] = await Promise.all([
    fetchCwbCsv(stationCode, stationLevelName, "TxMaxAbs", cwb),
    fetchCwbCsv(stationCode, stationLevelName, "TxMinAbs", cwb),
  ]);

  const dfMax = parseCsvRows(maxCsv, parseOpts);
  const dfMin = parseCsvRows(minCsv, parseOpts);

  const numYears = inferYearCountFromFilteredRows(dfMax, rowsPerYear);
  if (numYears < 1) {
    throw new Error(
      `Could not infer any full year blocks from CSV (${dfMax.length} rows / ${rowsPerYear} rows per year).`
    );
  }

  if (dfMin.length !== dfMax.length) {
    throw new Error("TxMaxAbs and TxMinAbs exports differ in row count; cannot pair them.");
  }

  const dataMax = dataMatrixFromFilteredRows(dfMax, numYears, rowsPerYear);
  const dataMin = dataMatrixFromFilteredRows(dfMin, numYears, rowsPerYear);

  const tMaxMean = meanOverYears(dataMax);
  const tMinMean = meanOverYears(dataMin);

  const mgdd = mgddFromMeans(tMaxMean, tMinMean, tb);
  const rotated = rotateFromPlantingDate(mgdd, startYear, startMonth, startDay);
  const sigma = cumulativeSum(rotated);

  const { x, y } = buildInterpolationNodes(sigma);
  const { f, n } = dividedDifferenceTable(x, y);
  const newX = newtonSolveForTheta(n, x, f, theta);

  const plant = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(plant);
  const days = Math.ceil(newX);
  end.setDate(end.getDate() + days);

  const yOut = end.getFullYear();
  const mo = String(end.getMonth() + 1).padStart(2, "0");
  const d = String(end.getDate()).padStart(2, "0");
  const harvestDate = `${yOut}-${mo}-${d}`;

  return {
    harvestDate,
    cumulativeDegreeDays: sigma,
    estimatedDays: days,
    meta: {
      historyStart: history.start,
      historyEnd: history.end,
      yearsAveraged: numYears,
      rowsPerYear,
      filteredRowCount: dfMax.length,
      sigmaLength: sigma.length,
    },
  };
}
