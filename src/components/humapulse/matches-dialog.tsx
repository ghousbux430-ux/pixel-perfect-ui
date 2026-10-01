import { useQuery } from "@tanstack/react-query";
import { MapPin, Send, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMatches } from "@/lib/humapulse-api";
import type { BloodRequest } from "@/lib/humapulse-types";
import { BloodGroupBadge, EligibilityBadge } from "./badges";

interface Props {
  request: BloodRequest | null;
  onOpenChange: (open: boolean) => void;
}

export function MatchesDialog({ request, onOpenChange }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["matches", request?.id],
    queryFn: () => fetchMatches(request!.id),
    enabled: Boolean(request),
  });

  return (
    <Dialog open={Boolean(request)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-5 w-5 text-primary" /> Smart donor matches
          </DialogTitle>
          <DialogDescription>
            {request
              ? `Top ranked donors for ${request.id} · ${request.blood_group} · ${request.hospital_name}`
              : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <p>
            <span className="font-semibold text-foreground">Privacy notice:</span> Donor contact
            information is masked for safety. Notifications are delivered through the platform only.
          </p>
        </div>

        <div className="grid gap-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
            : (data ?? []).map((m) => (
                <div
                  key={m.donor_id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <BloodGroupBadge group={m.blood_group} />
                  <div className="min-w-[9rem] flex-1">
                    <p className="font-semibold">{m.masked_name}</p>
                    <p className="text-xs text-muted-foreground">Donor ID: {m.donor_id}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Approximately {m.distance_km.toFixed(1)} km away
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      {m.match_score.toFixed(1)}% Match
                    </span>
                    <EligibilityBadge eligible={m.eligible} />
                  </div>
                  <Button
                    size="sm"
                    disabled={!m.eligible}
                    onClick={() =>
                      toast.success("Donor notified via platform", {
                        description: `${m.masked_name} received a secure alert for ${request?.id}.`,
                      })
                    }
                  >
                    <Send className="h-4 w-4" /> Notify donor
                  </Button>
                </div>
              ))}

          {!isLoading && (data ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No eligible donors matched this request yet.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
