import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Sparkles } from "lucide-react";

import { AppShell } from "@/components/humapulse/app-shell";
import { BloodGroupBadge, UrgencyBadge } from "@/components/humapulse/badges";
import { MatchesDialog } from "@/components/humapulse/matches-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { searchRequests } from "@/lib/humapulse-api";
import type { BloodRequest } from "@/lib/humapulse-types";

export const Route = createFileRoute("/matching")({
  head: () => ({
    meta: [
      { title: "Smart Matching Portal — HumaPulse" },
      {
        name: "description",
        content:
          "Rank eligible donors by match score and distance for any active blood request, with masked contact details.",
      },
      { property: "og:title", content: "Smart Matching Portal — HumaPulse" },
      {
        property: "og:description",
        content:
          "Rank eligible donors by match score and distance for any active blood request, with masked contact details.",
      },
    ],
  }),
  component: MatchingPage,
});

function MatchingPage() {
  const [selected, setSelected] = useState<BloodRequest | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["requests", { status: "active" }],
    queryFn: () => searchRequests({ status: "active" }),
  });

  return (
    <AppShell>
      <h1 className="flex items-center gap-2 text-4xl font-extrabold tracking-tight">
        <Sparkles className="h-8 w-8 text-primary" /> Smart matching portal
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Pick an active request to see the top-ranked donors scored on blood compatibility, distance
        and donation eligibility.
      </p>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <p>
          <span className="font-semibold text-foreground">Privacy notice:</span> Donor contact
          information is masked for safety. All outreach happens through the platform.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          : (data ?? []).map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <BloodGroupBadge group={r.blood_group} size="lg" />
                <div className="min-w-[12rem] flex-1">
                  <p className="font-semibold">{r.hospital_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.city} · {r.id} · {r.units_arranged}/{r.units_required} units arranged
                  </p>
                </div>
                <UrgencyBadge urgency={r.urgency} />
                <Button onClick={() => setSelected(r)}>Run smart match</Button>
              </div>
            ))}
      </div>

      <MatchesDialog request={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </AppShell>
  );
}
