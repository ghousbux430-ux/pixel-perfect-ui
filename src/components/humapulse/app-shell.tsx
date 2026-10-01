import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { HeartPulse, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateRequestDialog } from "./create-request-dialog";

const navItems = [
  { to: "/", label: "Feed / Requests" },
  { to: "/matching", label: "Smart Matching Portal" },
  { to: "/donors", label: "Donor Directory" },
  { to: "/dashboard", label: "Analytics Dashboard" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">HumaPulse</span>
          </Link>

          <nav className="order-3 flex w-full gap-1 overflow-x-auto md:order-2 md:w-auto md:flex-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-secondary-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-secondary-foreground"
                activeProps={{ className: "bg-sidebar-accent text-secondary-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Button className="order-2 ml-auto md:order-3" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create Emergency Request
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        HumaPulse · Smart Blood &amp; Emergency Donor Network
      </footer>

      <CreateRequestDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
