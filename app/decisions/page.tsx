import { Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DecisionsTable,
  type DecisionRow,
} from "@/components/decisions/decisions-table";
import {
  getActiveOrganization,
  getDecisions,
  getUsersById,
  nameOf,
} from "@/lib/data/queries";

export const metadata = { title: "Decision Center" };

export default async function DecisionsPage() {
  const [org, decisions, users] = await Promise.all([
    getActiveOrganization(),
    getDecisions(),
    getUsersById(),
  ]);
  const rows: DecisionRow[] = decisions.map((d) => ({
    ...d,
    reviewerName: nameOf(users, d.reviewerId),
    organizationName: org.name,
  }));

  const flagged = rows.filter(
    (d) => d.outcome === "flagged" || d.outcome === "denied",
  ).length;

  return (
    <div>
      <PageHeader
        title="Policy Decision Center"
        description="Every automated AI decision, the policy rule applied, the reviewer, and its tamper-evident evidence hash."
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" /> Export
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total Decisions" value={rows.length} />
        <Stat
          label="Approved"
          value={rows.filter((d) => d.outcome === "approved").length}
        />
        <Stat label="Flagged / Denied" value={flagged} />
        <Stat
          label="Escalated"
          value={rows.filter((d) => d.outcome === "escalated").length}
        />
      </div>

      <Card>
        <CardContent className="pt-5">
          <DecisionsTable data={rows} />
        </CardContent>
      </Card>
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
