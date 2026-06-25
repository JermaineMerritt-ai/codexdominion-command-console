import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPolicies, getUsersById, nameOf } from "@/lib/data/queries";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Policies" };

export default async function PoliciesPage() {
  const [policies, users] = await Promise.all([
    getPolicies(),
    getUsersById(),
  ]);
  const published = policies.filter((p) => p.status === "published").length;
  const draft = policies.filter((p) => p.status === "draft").length;

  return (
    <div>
      <PageHeader
        title="Policy Management"
        description="Author, version, publish, and archive the governance policies enforced across all AI systems."
      >
        <Button size="sm">
          <Plus className="h-4 w-4" /> New Policy
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total Policies" value={policies.length} />
        <Stat label="Published" value={published} />
        <Stat label="Draft" value={draft} />
        <Stat
          label="Total Rules"
          value={policies.reduce((a, p) => a + p.rulesCount, 0)}
        />
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Policy</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Version</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Rules</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="mt-0.5 max-w-md text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="neutral">{p.category}</Badge>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{p.version}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {nameOf(users, p.ownerId)}
                  </td>
                  <td className="px-5 py-3 tabular-nums">{p.rulesCount}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDate(p.lastUpdated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
