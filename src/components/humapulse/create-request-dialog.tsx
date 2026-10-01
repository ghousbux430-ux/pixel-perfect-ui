import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Crosshair, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, createRequest } from "@/lib/humapulse-api";
import { BLOOD_GROUPS, URGENCY_LEVELS, type BloodGroup, type Urgency } from "@/lib/humapulse-types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  blood_group: "" as BloodGroup | "",
  units_required: "1",
  hospital_name: "",
  city: "",
  latitude: "",
  longitude: "",
  required_before: "",
  urgency: "urgent" as Urgency,
  notes: "",
};

export function CreateRequestDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const set = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const mutation = useMutation({
    mutationFn: createRequest,
    onSuccess: (created) => {
      toast.success("Emergency request published", {
        description: `${created.id} · ${created.blood_group} · ${created.hospital_name}`,
      });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setForm(emptyForm);
      setErrors({});
      onOpenChange(false);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 400) {
        toast.error("Duplicate request detected", { description: err.message });
        return;
      }
      toast.error("Could not publish request", {
        description: err instanceof Error ? err.message : "Unexpected error",
      });
    },
  });

  function detectLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not available in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", pos.coords.latitude.toFixed(6));
        set("longitude", pos.coords.longitude.toFixed(6));
        toast.success("Location detected");
      },
      () => toast.error("Location permission denied"),
    );
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.blood_group) next["blood_group"] = "Select a blood group";
    const units = Number(form.units_required);
    if (!Number.isFinite(units) || units < 1 || units > 20)
      next["units_required"] = "Enter between 1 and 20 units";
    if (form.hospital_name.trim().length < 3) next["hospital_name"] = "Hospital name is required";
    if (form.city.trim().length < 2) next["city"] = "City is required";
    if (!form.required_before) next["required_before"] = "Pick a date and time";
    else if (new Date(form.required_before).getTime() < Date.now())
      next["required_before"] = "Must be in the future";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    mutation.mutate({
      blood_group: form.blood_group as BloodGroup,
      units_required: Number(form.units_required),
      hospital_name: form.hospital_name.trim(),
      city: form.city.trim(),
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      required_before: new Date(form.required_before).toISOString(),
      urgency: form.urgency,
      notes: form.notes.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create emergency request</DialogTitle>
          <DialogDescription>
            Verified hospital requests are broadcast to matched donors within the search radius.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-5 pt-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Blood group" error={errors["blood_group"]}>
              <Select
                value={form.blood_group}
                onValueChange={(v) => set("blood_group", v as BloodGroup)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Units required" error={errors["units_required"]}>
              <Input
                type="number"
                min={1}
                max={20}
                value={form.units_required}
                onChange={(e) => set("units_required", e.target.value)}
              />
            </Field>

            <Field label="Hospital name" error={errors["hospital_name"]}>
              <Input
                value={form.hospital_name}
                placeholder="e.g. Aga Khan University Hospital"
                onChange={(e) => set("hospital_name", e.target.value)}
              />
            </Field>

            <Field label="City" error={errors["city"]}>
              <Input
                value={form.city}
                placeholder="e.g. Karachi"
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-3">
            <Label>Geolocation</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={form.latitude}
                placeholder="Latitude"
                onChange={(e) => set("latitude", e.target.value)}
              />
              <Input
                value={form.longitude}
                placeholder="Longitude"
                onChange={(e) => set("longitude", e.target.value)}
              />
              <Button type="button" variant="outline" onClick={detectLocation} className="shrink-0">
                <Crosshair className="h-4 w-4" /> Auto-detect
              </Button>
            </div>
          </div>

          <Field label="Required before" error={errors["required_before"]}>
            <Input
              type="datetime-local"
              value={form.required_before}
              onChange={(e) => set("required_before", e.target.value)}
            />
          </Field>

          <div className="grid gap-3">
            <Label>Urgency level</Label>
            <RadioGroup
              value={form.urgency}
              onValueChange={(v) => set("urgency", v as Urgency)}
              className="grid gap-3 sm:grid-cols-3"
            >
              {URGENCY_LEVELS.map((level) => (
                <Label
                  key={level}
                  htmlFor={`urgency-${level}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm font-medium capitalize has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-accent"
                >
                  <RadioGroupItem id={`urgency-${level}`} value={level} />
                  {level}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Field label="Description / notes">
            <Textarea
              rows={3}
              value={form.notes}
              placeholder="Patient condition, ward, contact protocol…"
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
