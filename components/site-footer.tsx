import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Thermal — growing degree-day calculator</p>
          <p className="text-xs text-muted-foreground">
            Weather data: Taiwan Council of Agriculture historical station reports (2017–2021).
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Link href="/guide" className="hover:text-foreground">
            Guide
          </Link>
          <Link href="/background" className="hover:text-foreground">
            Background
          </Link>
          <Link href="/calculator" className="hover:text-foreground">
            Calculator
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
