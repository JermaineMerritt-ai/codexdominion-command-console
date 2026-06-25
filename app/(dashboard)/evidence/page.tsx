import { Download, RefreshCw, Archive } from "lucide-react";
import { Header } from "@/components/navigation/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchEvidencePacks } from "@/lib/api/evidence";
import { formatDateTime } from "@/lib/utils";
import type { EvidenceStatus } from "@/types";

export const metadata = { title: "Evidence Packs — CodexDominion" };

type EvidenceBadgeVariant = "success" | "warning" | "neutral";

const statusConfig: Record<
  EvidenceStatus,
  { label: string; variant: EvidenceBadgeVariant }
> = {
  ready: { label: "Ready", variant: "success" },
  generating: { label: "Generating…", variant: "warning" },
  archived: { label: "Archived", variant: "neutral" },
};

export default async function EvidencePage() {
  const packs = await fetchEvidencePacks();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header
        title="Evidence Packs"
        subtitle="Compiled compliance evidence for audits and certifications"
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {packs.filter((p) => p.status === "ready").length} packs ready for export
          </p>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Generate Evidence Pack
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packs.map((pack) => {
            const status = statusConfig[pack.status];
            return (
              <Card key={pack.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm">{pack.name}</CardTitle>
                      <CardDescription className="mt-0.5 text-xs">{pack.id}</CardDescription>
                    </div>
                    <Badge variant={status.variant} className="shrink-0 text-xs">
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-lg font-bold">{pack.policyCount}</p>
                      <p className="text-[10px] text-muted-foreground">Policies</p>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-lg font-bold">{pack.controlCount}</p>
                      <p className="text-[10px] text-muted-foreground">Controls</p>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-sm font-bold">{pack.fileSize ?? "—"}</p>
                      <p className="text-[10px] text-muted-foreground">Size</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {formatDateTime(pack.generatedAt)}
                    </span>
                    <div className="flex gap-1.5">
                      {pack.status === "archived" ? (
                        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                          <Archive className="h-3 w-3" /> Restore
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pack.status === "generating"}
                          className="h-7 gap-1.5 text-xs"
                        >
                          <Download className="h-3 w-3" /> Export
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
