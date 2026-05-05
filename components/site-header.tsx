"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/guide", label: "Guide" },
  { href: "/background", label: "Background" },
  { href: "/calculator", label: "Calculator" },
  { href: "/about", label: "About" },
] as const;

function NavLinks({
  mobile,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex gap-1", mobile ? "flex-col gap-0" : "items-center text-sm")}>
      {nav.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            "rounded-md px-3 py-2 font-medium transition-colors hover:bg-muted hover:text-foreground",
            pathname === href ? "bg-muted text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            Thermal
          </span>
          <span className="hidden sm:inline">積溫計算</span>
        </Link>

        <div className="hidden md:flex md:flex-1 md:justify-center">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/calculator"
            className={cn(buttonVariants({ size: "sm" }), "hidden md:inline-flex")}
          >
            Try calculator
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu" />
              }
            >
              <MenuIcon className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,320px)]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                <NavLinks mobile onNavigate={() => setMobileOpen(false)} />
                <Link
                  href="/calculator"
                  className={buttonVariants()}
                  onClick={() => setMobileOpen(false)}
                >
                  Try calculator
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
