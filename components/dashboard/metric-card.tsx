import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: { value: string; direction: "up" | "down"; positive: boolean };
  accent?: "default" | "warning" | "destructive" | "success";
  hint?: string;
}

const ACCENT: Record<string, string> = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/12 text-destructive",
  success: "bg-success/12 text-success",
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  delta,
  accent = "default",
  hint,
}: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            ACCENT[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              delta.positive ? "text-success" : "text-destructive",
            )}
          >
            {delta.direction === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {delta.value}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
