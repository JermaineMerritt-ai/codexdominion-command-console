import { CheckCircle2, FileText, AlertTriangle, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityEvent, ActivityType } from "@/types";
import { formatDateTime } from "@/lib/utils";

const activityConfig: Record<
  ActivityType,
  { icon: typeof CheckCircle2; color: string }
> = {
  approval: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
  review: { icon: FileText, color: "text-blue-500 bg-blue-50" },
  alert: { icon: AlertTriangle, color: "text-amber-500 bg-amber-50" },
  decision: { icon: Zap, color: "text-purple-500 bg-purple-50" },
};

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Governance Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4">
          {events.map((event, idx) => {
            const config = activityConfig[event.type];
            const Icon = config.icon;
            return (
              <li key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {idx < events.length - 1 && <div className="mt-1 h-full w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium leading-none">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{event.actor}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
