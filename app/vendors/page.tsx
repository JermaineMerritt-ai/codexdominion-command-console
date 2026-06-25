import {
  Check,
  X,
  Clock,
  Minus,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VendorActions } from "@/components/vendors/vendor-actions";
import { getUsersById, getVendors, nameOf } from "@/lib/data/queries";
import { formatDate } from "@/lib/utils";
import type { ComplianceState } from "@/types";

export const metadata = { title: "Vendors" };

function ComplianceCell({ state }: { state: ComplianceState }) {
  const map = {
    compliant: { Icon: Check, cls: "text-success", title: "Compliant" },
    pending: { Icon: Clock, cls: "text-warning", title: "Pending" },
    expired: { Icon: X, cls: "text-destructive", title: "Expired" },
    not_applicable: { Icon: Minus, cls: "text-muted-foreground", title: "N/A" },
  } as const;
  const { Icon, cls, title } = map[state];
  return (
    <span title={title} className={cls}>
      <Icon className="mx-auto h-4 w-4" />
    </span>
  );
}

function riskTone(score: number) {
  if (score >= 60) return "bg-destructive";
  if (score >= 40) return "bg-warning";
  return "bg-success";
}

function isExpiringSoon(iso: string) {
  const days = (new Date(iso).getTime() - new Date("2026-06-24").getTime()) / 86400000;
  return days <= 30;
}

export default async function VendorsPage() {
  const [vendors, users] = await Promise.all([getVendors(), getUsersById()]);
  const highRisk = vendors.filter((v) => v.riskScore >= 60).length;
  const expiring = vendors.filter((v) => isExpiringSoon(v.contractExpiresAt)).length;

  return (
    <div>
      <PageHeader
        title="Vendor Governance"
        description="Continuous third-party risk: security reviews, certifications, insurance, and contract status across the AI supply chain."
      >
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add Vendor
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total Vendors" value={vendors.length} />
        <Stat label="Approved" value={vendors.filter((v) => v.status === "approved").length} />
        <Stat label="High Risk" value={highRisk} tone="destructive" />
        <Stat label="Expiring ≤ 30d" value={expiring} tone="warning" />
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Risk Score</th>
                <th className="px-5 py-3 text-center">Security</th>
                <th className="px-5 py-3 text-center">Insurance</th>
                <th className="px-5 py-3 text-center">SOC 2</th>
                <th className="px-5 py-3 text-center">HIPAA</th>
                <th className="px-5 py-3 text-center">FedRAMP</th>
                <th className="px-5 py-3">Contract</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vendors.map((v) => {
                const expiring = isExpiringSoon(v.contractExpiresAt);
                return (
                  <tr key={v.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.category} · {nameOf(users, v.ownerId)}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full ${riskTone(v.riskScore)}`}
                            style={{ width: `${v.riskScore}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-xs font-medium">
                          {v.riskScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <ComplianceCell state={v.securityReview} />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <ComplianceCell state={v.insurance} />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <ComplianceCell state={v.soc2} />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <ComplianceCell state={v.hipaa} />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <ComplianceCell state={v.fedramp} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={
                          expiring
                            ? "flex items-center gap-1 text-warning"
                            : "text-muted-foreground"
                        }
                      >
                        {expiring && <AlertTriangle className="h-3.5 w-3.5" />}
                        {formatDate(v.contractExpiresAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <VendorActions vendorId={v.id} status={v.status} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Check className="h-3.5 w-3.5 text-success" /> Compliant
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-warning" /> Pending
        </span>
        <span className="flex items-center gap-1">
          <X className="h-3.5 w-3.5 text-destructive" /> Expired
        </span>
        <span className="flex items-center gap-1">
          <Minus className="h-3.5 w-3.5" /> Not applicable
        </span>
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "destructive" | "warning";
}) {
  const toneCls =
    tone === "destructive"
      ? "text-destructive"
      : tone === "warning"
        ? "text-warning"
        : "";
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneCls}`}>{value}</p>
    </Card>
  );
}
