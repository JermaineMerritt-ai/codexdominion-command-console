import { Header } from "@/components/navigation/header";
import { RiskCard } from "@/components/cards/risk-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchVendors } from "@/lib/api/vendors";
import type { VendorStatus } from "@/types";

export const metadata = { title: "Vendor Risk — CodexDominion" };

type VendorBadgeVariant = "success" | "warning" | "destructive";

const vendorStatusConfig: Record<
  VendorStatus,
  { label: string; variant: VendorBadgeVariant }
> = {
  active: { label: "Active", variant: "success" },
  "under-review": { label: "Under Review", variant: "warning" },
  suspended: { label: "Suspended", variant: "destructive" },
};

export default async function VendorsPage() {
  const vendors = await fetchVendors();

  const stats = {
    active: vendors.filter((v) => v.status === "active").length,
    review: vendors.filter((v) => v.status === "under-review").length,
    suspended: vendors.filter((v) => v.status === "suspended").length,
    pendingApprovals: vendors.filter((v) => v.approvalStatus === "pending").length,
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header
        title="Vendor Risk"
        subtitle="Third-party compliance posture and approval workflows"
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Active Vendors", value: stats.active, color: "text-emerald-600" },
            { label: "Under Review", value: stats.review, color: "text-amber-600" },
            { label: "Suspended", value: stats.suspended, color: "text-red-600" },
            { label: "Pending Approval", value: stats.pendingApprovals, color: "text-blue-600" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Vendor Registry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vendors.map((vendor) => {
                  const statusCfg = vendorStatusConfig[vendor.status];
                  return (
                    <div
                      key={vendor.id}
                      className="flex items-center justify-between rounded-md border px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-xs font-bold">
                          {vendor.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{vendor.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {vendor.category} · {vendor.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={statusCfg.variant} className="text-xs">
                          {statusCfg.label}
                        </Badge>
                        {vendor.approvalStatus === "pending" && (
                          <Button size="sm" className="h-7 text-xs">
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Attention Required
            </h3>
            {vendors
              .filter(
                (v) =>
                  v.riskLevel === "high" ||
                  v.riskLevel === "critical" ||
                  v.missingDocs.length > 0 ||
                  v.expiringCerts.length > 0
              )
              .map((vendor) => (
                <RiskCard
                  key={vendor.id}
                  vendorName={vendor.name}
                  category={vendor.category}
                  riskLevel={vendor.riskLevel}
                  missingDocs={vendor.missingDocs}
                  expiringCerts={vendor.expiringCerts}
                  approvalStatus={vendor.approvalStatus}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
