import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Multi-station coverage",
    description:
      "Pick a county and we map it to the corresponding COA trial station used in the reference implementation.",
  },
  {
    title: "Historical averages",
    description:
      "Daily max/min temperatures are averaged across five years of official station CSV exports (2017–2021).",
  },
  {
    title: "Numerical forecast",
    description:
      "MGDD accumulation with Newton divided-differences and Newton–Raphson iteration—ported faithfully from the original toolkit.",
  },
] as const;

const snippet = `// POST /api/thermal/calculate
{
  "startYear": 2024,
  "startMonth": 3,
  "startDay": 15,
  "county": "台中",
  "tb": 10,
  "theta": 1100
}`;

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-border/80 bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:py-28">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Built with Next.js
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Growing degree-days for predictable harvest timing
          </h1>
          <p className="mt-5 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            A minimal web interface for standardized MGDD (0–30°C cap), cumulative heat units, and forecast harvest
            dates using Taiwan Council of Agriculture historical weather exports.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/calculator"
              className={cn(buttonVariants({ size: "lg" }), "min-w-[200px] gap-2")}
            >
              Open calculator
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="/guide"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-w-[200px]")}
            >
              Read the guide
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:grid-cols-3 sm:px-6">
        {features.map((f) => (
          <Card key={f.title} className="border-border/80 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">{f.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">{f.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="border-y border-border/80 bg-muted/20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">The platform-agnostic idea</h2>
            <p className="text-muted-foreground leading-relaxed">
              Like a thin SDK sitting above providers, this app keeps the numerical core separate from the UI: weather
              CSV ingestion, seasonal rotation from your planting date, cumulative σ(Δt), then interpolation + root
              finding for the day count at your target degree-day total θ.
            </p>
            <Separator className="my-6" />
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Server-side fetches to the public COA report endpoint (no API keys).</li>
              <li>Typed request validation before any numeric work.</li>
              <li>Light theme only—built for clarity and outdoor-readable contrast.</li>
            </ul>
          </div>
          <Card className="overflow-hidden border-border/80 font-mono text-sm shadow-none">
            <CardHeader className="border-b border-border/80 bg-muted/40 py-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Example request</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="max-h-[320px] overflow-x-auto p-4 text-[13px] leading-relaxed">
                <code>{snippet}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Ready to run the numbers?</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Choose county, planting date, base temperature T<sub>b</sub>, and target θ—the API returns an ISO harvest
            estimate plus the cumulative series for debugging.
          </p>
        </div>
        <Link href="/calculator" className={cn(buttonVariants({ size: "lg" }), "shrink-0 gap-2")}>
          Launch calculator
          <ArrowRightIcon className="size-4" />
        </Link>
      </section>
    </div>
  );
}
