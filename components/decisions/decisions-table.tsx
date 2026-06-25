"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DecisionActions } from "@/components/decisions/decision-actions";
import { formatDateTime, shortHash } from "@/lib/utils";
import type { Decision } from "@/types";

export interface DecisionRow extends Decision {
  reviewerName: string;
  organizationName: string;
}

const columns: ColumnDef<DecisionRow, unknown>[] = [
  {
    accessorKey: "id",
    header: "Decision ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">{row.original.id}</span>
    ),
  },
  {
    accessorKey: "aiSystem",
    header: "AI System",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.aiSystem}</span>
    ),
  },
  {
    accessorKey: "workflowName",
    header: "Workflow",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.workflowName}</span>
    ),
  },
  {
    accessorKey: "policyRule",
    header: "Policy Rule",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.policyRule}
      </span>
    ),
  },
  {
    accessorKey: "outcome",
    header: "Decision",
    cell: ({ row }) => <StatusBadge status={row.original.outcome} />,
  },
  {
    accessorKey: "riskLevel",
    header: "Risk",
    cell: ({ row }) => <StatusBadge status={row.original.riskLevel} />,
  },
  {
    accessorKey: "reviewerName",
    header: "Reviewer",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.reviewerName}</span>
    ),
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {formatDateTime(row.original.timestamp)}
      </span>
    ),
  },
  {
    accessorKey: "evidenceHash",
    header: "Evidence Hash",
    cell: ({ row }) => (
      <span className="font-mono text-[11px] text-muted-foreground">
        {shortHash(row.original.evidenceHash)}
      </span>
    ),
  },
];

export function DecisionsTable({ data }: { data: DecisionRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by ID, system, rule…"
      renderExpanded={(d) => (
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rationale
            </p>
            <p className="mt-1">{d.rationale}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Organization" value={d.organizationName} />
              <Field label="Reviewer" value={d.reviewerName} />
              <Field label="Policy Rule" value={d.policyRule} />
              <Field label="Recorded" value={formatDateTime(d.timestamp)} />
            </div>
          </div>
          <div className="rounded-md border bg-card p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cryptographic Evidence
            </p>
            <p className="mt-2 break-all font-mono text-xs">{d.evidenceHash}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Hash-chained and tamper-evident. Included in the decision&apos;s
              evidence pack for examination.
            </p>
          </div>
          <div className="md:col-span-3 border-t pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reviewer Action
            </p>
            <DecisionActions decisionId={d.id} outcome={d.outcome} />
          </div>
        </div>
      )}
    />
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
