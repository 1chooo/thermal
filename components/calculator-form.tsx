"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CWB_DEFAULT_HISTORY } from "@/lib/thermal/cwb";
import { COUNTY_OPTIONS, type County } from "@/lib/thermal/stations";

/** Sensible demo defaults — user can submit immediately without empty fields. */
const DEFAULT_COUNTY: County = "台中";

type ApiMeta = {
  historyStart: string;
  historyEnd: string;
  yearsAveraged: number;
  rowsPerYear: number;
  filteredRowCount: number;
  sigmaLength: number;
};

type ApiOk = {
  harvestDate: string;
  estimatedDays: number;
  stationName: string;
  stationCode: string;
  meta: ApiMeta;
};

export function CalculatorForm() {
  /** Always a County — keeps Select controlled (never `undefined`). */
  const [county, setCounty] = React.useState<County>(DEFAULT_COUNTY);
  const [startYear, setStartYear] = React.useState("2024");
  const [startMonth, setStartMonth] = React.useState("3");
  const [startDay, setStartDay] = React.useState("15");
  const [tb, setTb] = React.useState("10");
  const [theta, setTheta] = React.useState("1100");
  const [historyStart, setHistoryStart] = React.useState<string>(CWB_DEFAULT_HISTORY.start);
  const [historyEnd, setHistoryEnd] = React.useState<string>(CWB_DEFAULT_HISTORY.end);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ApiOk | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hs = historyStart.trim();
    const he = historyEnd.trim();
    if ((hs || he) && !(hs && he)) {
      toast.error("Set both history dates or leave both empty.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/thermal/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startYear: Number(startYear),
          startMonth: Number(startMonth),
          startDay: Number(startDay),
          county,
          tb: Number(tb),
          theta: Number(theta),
          ...(historyStart.trim() && historyEnd.trim()
            ? { historyStart: historyStart.trim(), historyEnd: historyEnd.trim() }
            : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Request failed");
        return;
      }
      setResult(data as ApiOk);
      toast.success("Forecast computed");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-lg space-y-8">
      <Card className="border-border/80 shadow-none">
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
          <CardDescription>
            Values follow the original Tkinter tool: county maps to a COA station; T<sub>b</sub> is base temperature;
            θ is target degree-days. Defaults are filled so you can run immediately—change any field as needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="county">County / 縣市</Label>
            <Select value={county} onValueChange={(v) => setCounty(v as County)}>
              <SelectTrigger id="county" className="w-full min-w-0" size="default">
                <SelectValue placeholder={DEFAULT_COUNTY} />
              </SelectTrigger>
              <SelectContent>
                {COUNTY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="y">Year</Label>
              <Input
                id="y"
                inputMode="numeric"
                required
                placeholder="2024"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m">Month</Label>
              <Input
                id="m"
                inputMode="numeric"
                required
                min={1}
                max={12}
                placeholder="3"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d">Day</Label>
              <Input
                id="d"
                inputMode="numeric"
                required
                min={1}
                max={31}
                placeholder="15"
                value={startDay}
                onChange={(e) => setStartDay(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tb">
                Base temperature T<sub>b</sub> (°C)
              </Label>
              <Input
                id="tb"
                inputMode="decimal"
                required
                placeholder="10"
                value={tb}
                onChange={(e) => setTb(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theta">Target θ (degree-days)</Label>
              <Input
                id="theta"
                inputMode="numeric"
                required
                placeholder="1100"
                value={theta}
                onChange={(e) => setTheta(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-dashed border-border/80 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              COA CSV window (pre-filled to the same range as the server default). Clear both fields to omit from the
              request.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hstart">historyStart</Label>
                <Input
                  id="hstart"
                  placeholder={CWB_DEFAULT_HISTORY.start}
                  value={historyStart}
                  onChange={(e) => setHistoryStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hend">historyEnd</Label>
                <Input
                  id="hend"
                  placeholder={CWB_DEFAULT_HISTORY.end}
                  value={historyEnd}
                  onChange={(e) => setHistoryEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border/80 bg-muted/30 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Computing…
              </>
            ) : (
              "Calculate harvest date"
            )}
          </Button>
        </CardFooter>
      </Card>

      {result ? (
        <Card className="border-border/80 shadow-none">
          <CardHeader>
            <CardTitle>Estimated harvest</CardTitle>
            <CardDescription>
              Station: {result.stationName}{" "}
              <span className="text-muted-foreground">({result.stationCode})</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{result.harvestDate}</p>
            <p className="text-sm text-muted-foreground">
              ≈ {result.estimatedDays} days after planting to reach θ (ceil of numerical root).
            </p>
            <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Run metadata</p>
              <ul className="mt-2 list-inside list-disc space-y-0.5">
                <li>
                  History: {result.meta.historyStart} → {result.meta.historyEnd}
                </li>
                <li>Years averaged: {result.meta.yearsAveraged}</li>
                <li>
                  CSV layout: {result.meta.filteredRowCount} rows, {result.meta.rowsPerYear} rows/year
                </li>
                <li>σ length: {result.meta.sigmaLength} points</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </form>
  );
}
