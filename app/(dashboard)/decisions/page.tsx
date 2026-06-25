import { Header } from "@/components/navigation/header";
import { DecisionTable } from "@/components/tables/decision-table";
import { fetchPolicyDecisions } from "@/lib/api/decisions";

export const metadata = { title: "Policy Decisions — CodexDominion" };

export default async function DecisionsPage() {
  const decisions = await fetchPolicyDecisions();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header
        title="Policy Decisions"
        subtitle="Audit-ready governance records with evidence traceability"
      />
      <div className="flex-1 p-6">
        <DecisionTable decisions={decisions} />
      </div>
    </div>
  );
}
