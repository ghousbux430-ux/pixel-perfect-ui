import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Droplet, HeartHandshake, Percent, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/humapulse/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAnalytics } from "@/lib/humapulse-api";

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

const urgencyColors = ["var(--color-chart-4)", "var(--color-urgent)", "var(--color-critical)"];

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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.demand_by_blood_group}>
                  <XAxis dataKey="blood_group" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)" }}
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="requests" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Requests by urgency level">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.requests_by_urgency}
                    dataKey="count"
                    nameKey="urgency"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {data.requests_by_urgency.map((_, i) => (
                      <Cell key={i} fill={urgencyColors[i % urgencyColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
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
