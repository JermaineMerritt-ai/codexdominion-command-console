import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getUserName, getWorkflows } from "@/lib/data/queries";
import { formatDateTime } from "@/lib/utils";
import type { WorkflowState } from "@/types";

export const metadata = { title: "Workflows" };

const STATE_LABELS: Record<WorkflowState | "created", string> = {
  created: "Created",
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  denied: "Denied",
  escalated: "Escalated",
  closed: "Closed",
};

const STATE_ORDER: (WorkflowState | "created")[] = [
  "created",
  "pending_review",
  "approved",
  "closed",
];

export default function WorkflowsPage() {
  const workflows = getWorkflows();
  const counts = {
    active: workflows.filter(
      (w) => w.state === "pending_review" || w.state === "escalated",
    ).length,
    approved: workflows.filter((w) => w.state === "approved").length,
    draft: workflows.filter((w) => w.state === "draft").length,
    closed: workflows.filter((w) => w.state === "closed").length,
  };

  return (
    <div>
      <PageHeader
        title="Governance Workflows"
        description="Track every AI governance workflow from draft through review, approval, escalation, and closure."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Awaiting Review" value={counts.active} />
        <Stat label="Approved" value={counts.approved} />
        <Stat label="Draft" value={counts.draft} />
        <Stat label="Closed" value={counts.closed} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {workflows.map((w) => (
          <Card key={w.id}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{w.name}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {w.aiSystem} · Owner {getUserName(w.ownerId)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge status={w.state} />
                <StatusBadge status={w.riskLevel} />
              </div>
            </CardHeader>
            <CardContent>
              {/* Stepper */}
              <div className="mb-4 flex items-center">
                {STATE_ORDER.map((step, i) => {
                  const reached = w.timeline.some((t) => t.state === step);
                  const isCurrent =
                    w.state === step ||
                    (step === "created" && w.state === "draft");
                  return (
                    <div key={step} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={[
                            "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                            reached
                              ? "bg-primary text-primary-foreground"
                              : "border bg-muted text-muted-foreground",
                            isCurrent ? "ring-2 ring-primary/30" : "",
                          ].join(" ")}
                        >
                          {i + 1}
                        </div>
                        <span className="mt-1 whitespace-nowrap text-[10px] text-muted-foreground">
                          {STATE_LABELS[step]}
                        </span>
                      </div>
                      {i < STATE_ORDER.length - 1 && (
                        <div
                          className={[
                            "mx-1 h-0.5 flex-1",
                            reached ? "bg-primary" : "bg-border",
                          ].join(" ")}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Timeline log */}
              <ol className="relative space-y-3 border-l pl-4">
                {w.timeline.map((e, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {STATE_LABELS[e.state]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(e.at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getUserName(e.actorId)}
                      {e.note ? ` — ${e.note}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Card>
  );
}
