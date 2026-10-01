import { cn } from "@/lib/utils";
import type { RequestStatus, Urgency } from "@/lib/humapulse-types";

export function BloodGroupBadge({
  group,
  size = "md",
}: {
  group: string;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-primary/20 bg-accent font-extrabold tracking-tight text-accent-foreground",
        size === "lg" ? "h-14 w-16 text-2xl" : "h-9 w-12 text-sm",
      )}
    >
      {group}
    </span>
  );
}

const urgencyLabel: Record<Urgency, string> = {
  normal: "Normal",
  urgent: "Urgent",
  critical: "Critical",
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        urgency === "critical" && "pulse-critical bg-critical text-critical-foreground",
        urgency === "urgent" && "bg-urgent text-urgent-foreground",
        urgency === "normal" && "bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-current",
          urgency === "critical" && "animate-pulse",
        )}
      />
      {urgencyLabel[urgency]}
    </span>
  );
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        status === "active" && "border-success/30 bg-success/10 text-success-foreground",
        status === "fulfilled" && "border-border bg-muted text-muted-foreground",
        status === "cancelled" && "border-border bg-muted text-muted-foreground line-through",
      )}
    >
      {label}
    </span>
  );
}

export function EligibilityBadge({ eligible }: { eligible: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        eligible ? "bg-success/15 text-success-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      {eligible ? "Eligible" : "Cooling period"}
    </span>
  );
}
