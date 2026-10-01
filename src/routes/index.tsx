import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HeartPulse, Inbox } from "lucide-react";

import { AppShell } from "@/components/humapulse/app-shell";
import { FilterBar, type FeedFilters } from "@/components/humapulse/filter-bar";
import { MatchesDialog } from "@/components/humapulse/matches-dialog";
import { RequestCard } from "@/components/humapulse/request-card";
import { Skeleton } from "@/components/ui/skeleton";
import { searchRequests } from "@/lib/humapulse-api";
import type { BloodRequest } from "@/lib/humapulse-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Urgent Request Feed — HumaPulse" },
      {
        name: "description",
        content:
          "Live feed of urgent blood requests across hospitals, with smart donor matching and privacy-safe notifications.",
      },
      { property: "og:title", content: "Urgent Request Feed — HumaPulse" },
      {
        property: "og:description",
        content:
          "Live feed of urgent blood requests across hospitals, with smart donor matching and privacy-safe notifications.",
      },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const [filters, setFilters] = useState<FeedFilters>({
    blood_group: "all",
    city: "",
    urgency: "all",
    status: "active",
  });
  const [selected, setSelected] = useState<BloodRequest | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["requests", filters],
    queryFn: () => searchRequests(filters),
  });

  return (
    <AppShell>
      <section className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          <HeartPulse className="h-3.5 w-3.5" /> Live emergency network
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Urgent request feed
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Search live hospital requests, track arranged units in real time, and open the smart
          matching portal to reach the closest eligible donors.
        </p>
      </section>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))
          : (data ?? []).map((r) => (
              <RequestCard key={r.id} request={r} onViewMatches={setSelected} />
            ))}
      </div>

      {!isLoading && (data ?? []).length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-14 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No requests match these filters</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try widening the blood group, clearing the city, or switching the status filter.
          </p>
        </div>
      ) : null}

      <MatchesDialog request={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </AppShell>
  );
}
