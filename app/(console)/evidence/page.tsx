import { FileJson, FileText, FileArchive, Layers } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EvidenceGenerator } from "@/components/evidence/evidence-generator";
import { PackDownload } from "@/components/evidence/pack-download";
import {
  getDecisions,
  getEvidencePacks,
  getUsersById,
  nameOf,
} from "@/lib/data/queries";
import { getCurrentActor } from "@/lib/auth/actor";
import { formatDateTime, shortHash } from "@/lib/utils";

export const metadata = { title: "Evidence" };

const FORMAT_ICON = { JSON: FileJson, PDF: FileText, ZIP: FileArchive };

export default async function EvidencePage() {
  const [packs, allDecisions, users, actor] = await Promise.all([
    getEvidencePacks(),
    getDecisions(),
    getUsersById(),
    getCurrentActor(),
  ]);
  const decisions = allDecisions.map((d) => ({
    id: d.id,
    aiSystem: d.aiSystem,
    policyRule: d.policyRule,
    outcome: d.outcome,
    riskLevel: d.riskLevel,
    timestamp: d.timestamp,
    evidenceHash: d.evidenceHash,
  }));

  return (
    <div>
      <PageHeader
        title="Evidence Pack Generator"
        description="Tamper-evident, hash-chained evidence packs bundling decision history, approvals, policy checks, and audit events for examination."
      >
        <EvidenceGenerator decisions={decisions} role={actor.role} />
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total Packs" value={packs.length} icon={Layers} />
        <Stat
          label="Sealed"
          value={packs.filter((p) => p.status === "generated").length}
          icon={FileJson}
        />
        <Stat
          label="Generating"
          value={packs.filter((p) => p.status === "generating").length}
          icon={FileText}
        />
        <Stat
          label="Archived"
          value={packs.filter((p) => p.status === "archived").length}
          icon={FileArchive}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {packs.map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div className="min-w-0">
                <CardTitle className="text-base">{p.title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.id} · {nameOf(users, p.responsibleUserId)}
                </p>
              </div>
              <StatusBadge status={p.status} />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field
                  label="Generated"
                  value={formatDateTime(p.generatedAt)}
                />
                <Field
                  label="Decisions"
                  value={`${p.decisionIds.length} included`}
                />
                <Field
                  label="Size"
                  value={p.sizeKb ? `${(p.sizeKb / 1024).toFixed(1)} MB` : "—"}
                />
                <div>
                  <p className="text-xs text-muted-foreground">Formats</p>
                  <div className="mt-1 flex gap-1.5">
                    {p.format.map((f) => {
                      const Icon = FORMAT_ICON[f];
                      return (
                        <Badge key={f} variant="neutral" className="gap-1">
                          <Icon className="h-3 w-3" />
                          {f}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-md border bg-muted/40 p-2.5">
                <p className="text-[11px] text-muted-foreground">
                  Evidence hash
                </p>
                <p className="font-mono text-xs">{shortHash(p.hash)}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {p.decisionIds.join(", ")}
                </span>
                <PackDownload pack={p} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Layers;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </Card>
  );
}
