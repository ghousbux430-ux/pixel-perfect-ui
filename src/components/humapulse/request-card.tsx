import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, Clock, MapPin, Share2, Users, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { updateRequestStatus } from "@/lib/humapulse-api";
import type { BloodRequest } from "@/lib/humapulse-types";
import { BloodGroupBadge, StatusBadge, UrgencyBadge } from "./badges";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} d ago`;
}

export function RequestCard({
  request,
  onViewMatches,
}: {
  request: BloodRequest;
  onViewMatches: (request: BloodRequest) => void;
}) {
  const queryClient = useQueryClient();
  const percent = Math.min(100, (request.units_arranged / request.units_required) * 100);

  const statusMutation = useMutation({
    mutationFn: (status: "fulfilled" | "cancelled") => updateRequestStatus(request.id, status),
    onSuccess: (_d, status) => {
      toast.success(status === "fulfilled" ? "Request marked fulfilled" : "Request cancelled");
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: () => toast.error("Could not update the request"),
  });

  async function share() {
    const text = `${request.blood_group} blood needed at ${request.hospital_name}, ${request.city} (${request.id})`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "HumaPulse emergency request", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Request details copied to clipboard");
      }
    } catch {
      toast.error("Sharing was cancelled");
    }
  }

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-emergency)]">
      <div className="flex items-start gap-4">
        <BloodGroupBadge group={request.blood_group} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyBadge urgency={request.urgency} />
            <StatusBadge status={request.status} />
          </div>
          <h3 className="mt-2 flex items-center gap-1.5 truncate font-semibold">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            {request.hospital_name}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {request.city}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {timeAgo(request.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> Requester {request.requester_id}
            </span>
          </p>
        </div>
      </div>

      {request.notes ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">{request.notes}</p>
      ) : null}

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">Units arranged</span>
          <span>
            {request.units_arranged}/{request.units_required} units
          </span>
        </div>
        <Progress value={percent} className="h-2" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onViewMatches(request)}>
          View matches
        </Button>
        <Button size="sm" variant="outline" onClick={share}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
        {request.status === "active" ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate("fulfilled")}
            >
              <CheckCircle2 className="h-4 w-4" /> Fulfill
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate("cancelled")}
            >
              <XCircle className="h-4 w-4" /> Cancel
            </Button>
          </>
        ) : null}
      </div>
    </article>
  );
}
