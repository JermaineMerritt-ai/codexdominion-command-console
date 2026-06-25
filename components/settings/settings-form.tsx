"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { OrganizationSettings } from "@/types";

const schema = z.object({
  requireDualApproval: z.boolean(),
  autoGenerateEvidence: z.boolean(),
  notifyOnViolation: z.boolean(),
  retentionDays: z.coerce.number().min(30).max(3650),
  riskThreshold: z.coerce.number().min(0).max(100),
  dataRegion: z.enum(["us-east", "us-gov", "eu-west"]),
});

type FormValues = z.infer<typeof schema>;

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsForm({ initial }: { initial: OrganizationSettings }) {
  const { register, handleSubmit, watch, setValue, formState } =
    useForm<FormValues>({
      defaultValues: {
        requireDualApproval: initial.requireDualApproval,
        autoGenerateEvidence: initial.autoGenerateEvidence,
        notifyOnViolation: initial.notifyOnViolation,
        retentionDays: initial.retentionDays,
        riskThreshold: initial.riskThreshold,
        dataRegion: initial.dataRegion,
      },
    });

  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const values = watch();

  function onSubmit(data: FormValues) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) return;
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 700);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Governance Controls</CardTitle>
          <CardDescription>
            Enforcement rules applied across all AI decisions.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y pt-0">
          <Toggle
            label="Require dual approval"
            description="High-risk decisions need two independent reviewers."
            checked={values.requireDualApproval}
            onChange={(v) => setValue("requireDualApproval", v)}
          />
          <Toggle
            label="Auto-generate evidence"
            description="Automatically seal an evidence pack when a workflow closes."
            checked={values.autoGenerateEvidence}
            onChange={(v) => setValue("autoGenerateEvidence", v)}
          />
          <Toggle
            label="Notify on policy violation"
            description="Alert compliance officers the moment a violation is detected."
            checked={values.notifyOnViolation}
            onChange={(v) => setValue("notifyOnViolation", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thresholds & Retention</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Escalation risk threshold
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              {...register("riskThreshold")}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Score (0–100) above which decisions auto-escalate.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Evidence retention (days)
            </label>
            <Input
              type="number"
              min={30}
              max={3650}
              {...register("retentionDays")}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              How long evidence packs are retained.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Data region</label>
            <select
              {...register("dataRegion")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="us-east">US East</option>
              <option value="us-gov">US Gov (GovCloud)</option>
              <option value="eu-west">EU West</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Residency for governance data.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-success">
            <Check className="h-4 w-4" /> Settings saved
          </span>
        )}
        <Button type="submit" disabled={saving || !formState.isDirty && !saved}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
