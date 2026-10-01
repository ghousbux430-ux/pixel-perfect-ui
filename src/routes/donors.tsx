import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Search, Users } from "lucide-react";

import { AppShell } from "@/components/humapulse/app-shell";
import { BloodGroupBadge } from "@/components/humapulse/badges";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDonors } from "@/lib/humapulse-api";
import { BLOOD_GROUPS } from "@/lib/humapulse-types";

export const Route = createFileRoute("/donors")({
  head: () => ({
    meta: [
      { title: "Donor Directory — HumaPulse" },
      {
        name: "description",
        content:
          "Browse verified blood donors by group, city and availability. Identities stay masked until a donor accepts a request.",
      },
      { property: "og:title", content: "Donor Directory — HumaPulse" },
      {
        property: "og:description",
        content:
          "Browse verified blood donors by group, city and availability. Identities stay masked until a donor accepts a request.",
      },
    ],
  }),
  component: DonorsPage,
});

function DonorsPage() {
  const [filters, setFilters] = useState({ blood_group: "all", city: "", available: "all" });
  const { data, isLoading } = useQuery({
    queryKey: ["donors", filters],
    queryFn: () => fetchDonors(filters),
  });

  return (
    <AppShell>
      <h1 className="flex items-center gap-2 text-4xl font-extrabold tracking-tight">
        <Users className="h-8 w-8 text-primary" /> Donor directory
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Verified donors across the network. Names and contacts remain masked until a donor accepts a
        request.
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:grid-cols-3">
        <div className="grid gap-2">
          <Label>Blood group</Label>
          <Select
            value={filters.blood_group}
            onValueChange={(v) => setFilters({ ...filters, blood_group: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              {BLOOD_GROUPS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>City</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search city"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Availability</Label>
          <Select
            value={filters.available}
            onValueChange={(v) => setFilters({ ...filters, available: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              <SelectItem value="available">Available now</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))
          : (data ?? []).map((d) => (
              <div
                key={d.id}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <BloodGroupBadge group={d.blood_group} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-semibold">
                    {d.masked_name}
                    {d.verified ? <BadgeCheck className="h-4 w-4 text-success" /> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.city} · {d.total_donations} donations
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last donation:{" "}
                    {d.last_donation ? new Date(d.last_donation).toLocaleDateString() : "—"}
                  </p>
                  <span
                    className={
                      d.available
                        ? "mt-3 inline-flex rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success-foreground"
                        : "mt-3 inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                    }
                  >
                    {d.available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            ))}
      </div>

      {!isLoading && (data ?? []).length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card p-14 text-center text-sm text-muted-foreground">
          No donors match these filters yet.
        </p>
      ) : null}
    </AppShell>
  );
}
