import { Badge, type BadgeProps } from "@/components/ui/badge";

type Variant = NonNullable<BadgeProps["variant"]>;

const MAP: Record<string, { label: string; variant: Variant }> = {
  // risk levels
  low: { label: "Low", variant: "success" },
  medium: { label: "Medium", variant: "warning" },
  high: { label: "High", variant: "destructive" },
  critical: { label: "Critical", variant: "destructive" },
  // decision outcomes
  approved: { label: "Approved", variant: "success" },
  denied: { label: "Denied", variant: "destructive" },
  flagged: { label: "Flagged", variant: "warning" },
  escalated: { label: "Escalated", variant: "warning" },
  // workflow states
  draft: { label: "Draft", variant: "neutral" },
  pending_review: { label: "Pending Review", variant: "warning" },
  closed: { label: "Closed", variant: "neutral" },
  // policy statuses
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "neutral" },
  // approval statuses
  pending: { label: "Pending", variant: "warning" },
  // vendor statuses
  under_review: { label: "Under Review", variant: "warning" },
  expiring: { label: "Expiring", variant: "warning" },
  // compliance states
  compliant: { label: "Compliant", variant: "success" },
  expired: { label: "Expired", variant: "destructive" },
  not_applicable: { label: "N/A", variant: "neutral" },
  // opportunity statuses
  tracking: { label: "Tracking", variant: "neutral" },
  qualifying: { label: "Qualifying", variant: "default" },
  bid: { label: "Bid", variant: "default" },
  submitted: { label: "Submitted", variant: "default" },
  won: { label: "Won", variant: "success" },
  lost: { label: "Lost", variant: "destructive" },
  no_bid: { label: "No Bid", variant: "neutral" },
  // user statuses
  active: { label: "Active", variant: "success" },
  invited: { label: "Invited", variant: "warning" },
  suspended: { label: "Suspended", variant: "destructive" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const entry = MAP[status] ?? { label: status, variant: "neutral" as Variant };
  return (
    <Badge variant={entry.variant} className={className}>
      {entry.label}
    </Badge>
  );
}
