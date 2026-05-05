/**
 * Taiwan COA ag-meteorology CSV helpers.
 * Defaults match the original Python reference; options let you change the
 * history window or parsing rules when the upstream layout differs.
 */

/** Row numbers (1-based) skipped for the standard COA multi-year CSV layout. */
export const CWB_CSV_SKIP_ROWS_DEFAULT = new Set([
  1, 2, 35, 36, 37, 38, 71, 72, 73, 74, 107, 108, 109, 110, 143, 144, 145, 146, 179,
  180,
]);

/** Original Python app used this fixed window. */
export const CWB_DEFAULT_HISTORY = {
  start: "2017-01-01",
  end: "2021-12-31",
} as const;

/** Rows per calendar year block in the filtered matrix (COA export convention). */
export const CWB_ROWS_PER_YEAR_DEFAULT = 32;

export type CwbHistoryRange = {
  /** Inclusive, `YYYY-MM-DD` */
  start: string;
  /** Inclusive, `YYYY-MM-DD` */
  end: string;
};

export type CwbParseOptions = {
  /** 1-based line numbers to drop before building the data matrix (headers / separators). */
  skipRows?: Set<number>;
  /** Rows allocated per year in the grid (default 32 for COA CSV). */
  rowsPerYear?: number;
};

export type CwbFetchOptions = {
  history?: CwbHistoryRange;
  parse?: CwbParseOptions;
};

/**
 * Agricultural weather CSV endpoint (CWA 農業氣象觀測網).
 * The legacy host `agr.cwb.gov.tw` no longer resolves — use `agr.cwa.gov.tw`.
 * Override with env `THERMAL_CWB_REPORT_BASE` (full path, no trailing `?`).
 */
export const CWB_DEFAULT_REPORT_BASE =
  "https://agr.cwa.gov.tw/NAGR/history/station_day/create_report";

function reportBaseUrl(): string {
  const fromEnv = process.env.THERMAL_CWB_REPORT_BASE?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return CWB_DEFAULT_REPORT_BASE;
}

function mergeParseOptions(parse?: CwbParseOptions): Required<CwbParseOptions> {
  return {
    skipRows: parse?.skipRows ?? CWB_CSV_SKIP_ROWS_DEFAULT,
    rowsPerYear: parse?.rowsPerYear ?? CWB_ROWS_PER_YEAR_DEFAULT,
  };
}

/**
 * Split raw CSV text into filtered rows (same as Python’s `df` list).
 * Pass a custom `skipRows` if a future export changes header spacing.
 */
export function parseCsvRows(content: string, parse?: CwbParseOptions): string[][] {
  const { skipRows } = mergeParseOptions(parse);
  const lines = content.split(/\r?\n/).filter((l) => l.length > 0);
  const rows: string[][] = [];
  let lineNo = 1;
  for (const line of lines) {
    if (!skipRows.has(lineNo)) {
      rows.push(line.split(","));
    }
    lineNo += 1;
  }
  return rows;
}

/**
 * How many full year-blocks fit in the filtered CSV (inferred; no magic `5`).
 */
export function inferYearCountFromFilteredRows(
  filteredRows: string[][],
  rowsPerYear: number = CWB_ROWS_PER_YEAR_DEFAULT
): number {
  const n = Math.floor(filteredRows.length / rowsPerYear);
  return Math.max(0, n);
}

export function buildCwbReportUrl(
  stationCode: string,
  stationLevelName: string,
  items: "TxMaxAbs" | "TxMinAbs",
  history: CwbHistoryRange = CWB_DEFAULT_HISTORY
): string {
  const params = new URLSearchParams({
    station: stationCode,
    start_time: history.start,
    end_time: history.end,
    items,
    report_type: "csv",
    level: stationLevelName,
  });
  return `${reportBaseUrl()}?${params.toString()}`;
}

function explainFetchFailure(url: string, err: unknown): Error {
  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "weather host";
    }
  })();

  let detail = err instanceof Error ? err.message : String(err);
  const cause = err instanceof Error && err.cause instanceof Error ? err.cause.message : "";
  if (cause) detail = `${detail} (${cause})`;

  if (/ENOTFOUND|getaddrinfo|fetch failed/i.test(detail)) {
    return new Error(
      `Cannot resolve or reach ${hostname} (${detail}). ` +
        `The service moved to agr.cwa.gov.tw — ensure you are on the latest app default, or set THERMAL_CWB_REPORT_BASE to a reachable report URL.`
    );
  }

  return new Error(`Weather CSV request failed for ${hostname}: ${detail}`);
}

export async function fetchCwbCsv(
  stationCode: string,
  stationLevelName: string,
  items: "TxMaxAbs" | "TxMinAbs",
  options?: CwbFetchOptions
): Promise<string> {
  const history = options?.history ?? CWB_DEFAULT_HISTORY;
  const url = buildCwbReportUrl(stationCode, stationLevelName, items, history);

  let res: Response;
  try {
    res = await fetch(url, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(45_000),
    });
  } catch (err) {
    throw explainFetchFailure(url, err);
  }

  if (!res.ok) {
    throw new Error(`Weather service returned ${res.status} for ${items}`);
  }
  return res.text();
}
