import { Link2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "@/components/settings/settings-form";
import {
  getActiveOrganization,
  getAuditEvents,
  getUsersById,
  nameOf,
} from "@/lib/data/queries";
import { formatDateTime } from "@/lib/utils";
import type { OrganizationSettings } from "@/types";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [org, audit, users] = await Promise.all([
    getActiveOrganization(),
    getAuditEvents(),
    getUsersById(),
  ]);
  const settings: OrganizationSettings = {
    organizationId: org.id,
    requireDualApproval: true,
    autoGenerateEvidence: true,
    notifyOnViolation: true,
    retentionDays: 2555,
    riskThreshold: 70,
    dataRegion: "us-east",
  };

  return (
    <div>
      <PageHeader
        title="Organization Settings"
        description={`Governance configuration and tamper-evident audit trail for ${org.name}.`}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SettingsForm initial={settings} />
        </div>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>
              Hash-chained, tamper-evident system events.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <ol className="max-h-[560px] divide-y overflow-y-auto">
              {audit.map((e) => (
                <li key={e.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="neutral" className="font-mono">
                      {e.type}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDateTime(e.at)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm">{e.summary}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {nameOf(users, e.actorId)} · target {e.target}
                  </p>
                  <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <Link2 className="h-3 w-3" />
                    {e.prevHash} → {e.hash}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
