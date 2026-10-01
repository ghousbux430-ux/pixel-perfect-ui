import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BLOOD_GROUPS } from "@/lib/humapulse-types";

export interface FeedFilters {
  blood_group: string;
  city: string;
  urgency: string;
  status: string;
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: FeedFilters;
  onChange: (next: FeedFilters) => void;
}) {
  const set = (key: keyof FeedFilters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-4">
      <div className="grid gap-2">
        <Label>Blood group</Label>
        <Select value={filters.blood_group} onValueChange={(v) => set("blood_group", v)}>
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
            onChange={(e) => set("city", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Urgency</Label>
        <Select value={filters.urgency} onValueChange={(v) => set("urgency", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Status</Label>
        <Select value={filters.status} onValueChange={(v) => set("status", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
