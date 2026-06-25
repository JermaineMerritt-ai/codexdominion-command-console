import { AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types";

type RiskBadgeVariant = "success" | "warning" | "destructive" | "secondary";

interface RiskCardProps {
  vendorName: string;
  category: string;
  riskLevel: RiskLevel;
  missingDocs: string[];
  expiringCerts: { name: string; expiresAt: string }[];
  approvalStatus: "approved" | "pending" | "rejected";
}

const riskConfig: Record<
  RiskLevel,
  { label: string; variant: RiskBadgeVariant; icon: typeof CheckCircle2 }
> = {
  low: { label: "Low Risk", variant: "success", icon: CheckCircle2 },
  medium: { label: "Medium Risk", variant: "warning", icon: AlertTriangle },
  high: { label: "High Risk", variant: "destructive", icon: AlertTriangle },
  critical: { label: "Critical Risk", variant: "destructive", icon: XCircle },
};

export function RiskCard({
  vendorName,
  category,
  riskLevel,
  missingDocs,
  expiringCerts,
  approvalStatus,
}: RiskCardProps) {
  const risk = riskConfig[riskLevel];
  const RiskIcon = risk.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{vendorName}</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">{category}</p>
          </div>
          <Badge variant={risk.variant} className="flex shrink-0 items-center gap-1">
            <RiskIcon className="h-3 w-3" />
            {risk.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {missingDocs.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Missing Documentation</p>
            <ul className="space-y-1">
              {missingDocs.map((doc) => (
                <li key={doc} className="flex items-center gap-1.5 text-xs text-destructive">
                  <XCircle className="h-3 w-3 shrink-0" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {expiringCerts.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Expiring Certifications</p>
            <ul className="space-y-1">
              {expiringCerts.map((cert) => (
                <li key={cert.name} className="flex items-center gap-1.5 text-xs text-amber-600">
                  <Clock className="h-3 w-3 shrink-0" />
                  {cert.name} — expires {new Date(cert.expiresAt).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {missingDocs.length === 0 && expiringCerts.length === 0 && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> All compliance requirements met
          </p>
        )}

        <div className="flex items-center justify-between border-t pt-1">
          <span className="text-xs text-muted-foreground">Approval Status</span>
          <Badge
            variant={
              approvalStatus === "approved"
                ? "success"
                : approvalStatus === "pending"
                  ? "warning"
                  : "destructive"
            }
            className="text-xs"
          >
            {approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
