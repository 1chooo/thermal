import { z } from "zod";

import { computeThermalHarvest } from "@/lib/thermal/thermalTime";
import { COUNTY_OPTIONS, getStationByCounty } from "@/lib/thermal/stations";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const bodySchema = z
  .object({
    startYear: z.number().int().min(1990).max(2100),
    startMonth: z.number().int().min(1).max(12),
    startDay: z.number().int().min(1).max(31),
    county: z.string().min(1),
    tb: z.number(),
    theta: z.number().positive(),
    /** Inclusive COA `start_time` for CSV export (optional; default 2017-01-01). */
    historyStart: isoDate.optional(),
    /** Inclusive COA `end_time` for CSV export (optional; default 2021-12-31). */
    historyEnd: isoDate.optional(),
  })
  .refine(
    (d) => (d.historyStart === undefined) === (d.historyEnd === undefined),
    "Provide both historyStart and historyEnd, or neither."
  )
  .refine((d) => {
    if (!d.historyStart || !d.historyEnd) return true;
    const a = new Date(`${d.historyStart}T00:00:00`);
    const b = new Date(`${d.historyEnd}T00:00:00`);
    return !Number.isNaN(+a) && !Number.isNaN(+b) && a < b;
  }, "historyStart must be before historyEnd and both must be valid dates.")
  .refine((d) => {
    if (!d.historyStart || !d.historyEnd) return true;
    const a = new Date(`${d.historyStart}T00:00:00`);
    const b = new Date(`${d.historyEnd}T00:00:00`);
    const days = (b.getTime() - a.getTime()) / 86_400_000;
    return days <= 366 * 40;
  }, "History window too long (max 40 years).");

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const { startYear, startMonth, startDay, county, tb, theta, historyStart, historyEnd } =
    parsed.data;
  const station = getStationByCounty(county);
  if (!station) {
    return Response.json(
      { error: `Unknown county. Use one of: ${COUNTY_OPTIONS.join(", ")}` },
      { status: 400 }
    );
  }

  const trial = new Date(startYear, startMonth - 1, startDay);
  if (
    trial.getFullYear() !== startYear ||
    trial.getMonth() !== startMonth - 1 ||
    trial.getDate() !== startDay
  ) {
    return Response.json({ error: "Invalid calendar date" }, { status: 400 });
  }

  try {
    const result = await computeThermalHarvest({
      startYear,
      startMonth,
      startDay,
      stationCode: station.stationCode,
      stationLevelName: station.stationName,
      tb,
      theta,
      cwb:
        historyStart && historyEnd
          ? { history: { start: historyStart, end: historyEnd } }
          : undefined,
    });

    return Response.json({
      harvestDate: result.harvestDate,
      estimatedDays: result.estimatedDays,
      cumulativeDegreeDays: result.cumulativeDegreeDays,
      meta: result.meta,
      stationName: station.stationName,
      stationCode: station.stationCode,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Upstream weather data unavailable";
    return Response.json({ error: message }, { status: 502 });
  }
}
