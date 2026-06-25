import Link from "next/link";
import {
  Landmark,
  Terminal,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Boxes,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { getBankingEdition, BANKTRUST_ID } from "@/lib/banking/edition";

export const metadata = { title: "BankTrust OS" };
export const revalidate = 30;

export default async function BankingPage() {
  const edition = await getBankingEdition();
  const m = edition.module;

  return (
    <div>
      <PageHeader
        title="CodexDominion BankTrust OS"
        description="The AI Governance Operating System for community & regional banking — built on the CodexDominion platform. Same governance engine; banking operating environment."
      >
        <Badge variant="default" className="gap-1">
          <Landmark className="h-3.5 w-3.5" /> Banking Edition
        </Badge>
      </PageHeader>

      {/* Executive KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {edition.kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p
              className={`mt-1 text-2xl font-semibold ${
                k.tone === "warning"
                  ? "text-warning"
                  : k.tone === "destructive"
                    ? "text-destructive"
                    : k.tone === "success"
                      ? "text-success"
                      : ""
              }`}
            >
              {k.value}
            </p>
            {k.hint && <p className="text-[11px] text-muted-foreground">{k.hint}</p>}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Banking commands */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-4 w-4" /> Banking Command Workspace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Banking prompts run through the same governed pipeline — parsed,
              permission-checked, executed, and audited.
            </p>
            <div className="flex flex-wrap gap-2">
              {edition.commands.map((c) => (
                <Link
                  key={c}
                  href={`/command?q=${encodeURIComponent(c)}`}
                  className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {c}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-4 w-4" /> Module
            </CardTitle>
          </CardHeader>
          <CardContent>
            {m ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{m.name}</p>
                  <StatusBadge status={m.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.category} · {m.integrationMaturity}% integrated
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Metric label="Workflows" value={m.metrics.activeWorkflows} />
                  <Metric label="Decisions" value={m.metrics.openDecisions} />
                  <Metric label="Risks" value={m.metrics.riskFlags} />
                </div>
                <Link
                  href={`/modules/${BANKTRUST_ID}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Open module <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Module not registered.</p>
            )}
          </CardContent>
        </Card>

        {/* Regulators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Regulators & Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {edition.regulations.map((r) => (
              <Badge key={r} variant="neutral">{r}</Badge>
            ))}
          </CardContent>
        </Card>

        {/* Evidence types */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4" /> Regulatory Evidence Packs
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {edition.evidenceTypes.map((e) => (
              <Badge key={e} variant="outline">{e}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        BankTrust OS is the first <span className="font-medium">industry edition</span>{" "}
        of CodexDominion. The same governance platform powers healthcare,
        government, and other regulated industries through industry-specific
        operating environments.
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 py-2">
      <p className="text-base font-semibold">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
