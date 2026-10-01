import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Droplet, HeartHandshake, Percent, Users } from "lucide-react";
import { lazy, Suspense } from "react";

import { AppShell } from "@/components/humapulse/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAnalytics } from "@/lib/humapulse-api";

// Charts (recharts) are code-split so the dashboard shell loads instantly.
const DemandChart = lazy(() =>
  import("@/components/humapulse/dashboard-charts").then((m) => ({ default: m.DemandChart })),
);
const UrgencyChart = lazy(() =>
  import("@/components/humapulse/dashboard-charts").then((m) => ({ default: m.UrgencyChart })),
);

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Analytics Dashboard — HumaPulse" },
      {
        name: "description",
        content:
          "Network KPIs: active emergencies, completed donations, donor availability and fulfillment rate across blood groups.",
      },
      { property: "og:title", content: "Analytics Dashboard — HumaPulse" },
      {
        property: "og:description",
        content:
          "Network KPIs: active emergencies, completed donations, donor availability and fulfillment rate across blood groups.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: fetchAnalytics });

  return (
    <AppShell>
      <h1 className="text-4xl font-extrabold tracking-tight">Analytics dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Real-time health of the HumaPulse emergency donor network.
      </p>

      {isLoading || !data ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Kpi icon={Activity} label="Total requests" value={data.total_requests.toLocaleString()} />
            <Kpi
              icon={Droplet}
              label="Active emergencies"
              value={data.active_emergency_requests.toLocaleString()}
              accent
            />
            <Kpi
              icon={HeartHandshake}
              label="Completed donations"
              value={data.completed_donations.toLocaleString()}
            />
            <Kpi
              icon={Users}
              label="Available / registered donors"
              value={`${data.available_donors.toLocaleString()} / ${data.registered_donors.toLocaleString()}`}
            />
            <Kpi
              icon={Percent}
              label="Fulfillment rate"
              value={`${data.fulfillment_rate.toFixed(1)}%`}
            />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <ChartCard title="Demand breakdown by blood group">
              <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
                <DemandChart data={data.demand_by_blood_group} />
              </Suspense>
            </ChartCard>

            <ChartCard title="Requests by urgency level">
              <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
                <UrgencyChart data={data.requests_by_urgency} />
              </Suspense>
            </ChartCard>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className={accent ? "h-4 w-4 text-primary" : "h-4 w-4"} />
        {label}
      </div>
      <p className={accent ? "stat-number mt-3 text-3xl text-primary" : "stat-number mt-3 text-3xl"}>
        {value}
      </p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </div>
  );
}
