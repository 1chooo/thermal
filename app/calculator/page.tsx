import { CalculatorForm } from "@/components/calculator-form";

export default function CalculatorPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-12 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Calculator</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Server-side calculation hits the public COA CSV endpoint twice (daily max and min), rebuilds five-year mean
          grids, then runs the same MGDD + Newton pipeline as the legacy desktop app.
        </p>
      </div>
      <CalculatorForm />
    </div>
  );
}
