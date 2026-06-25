"use client";
import { useState } from "react";
import { Search, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { PolicyDecision, PolicyStatus } from "@/types";
import { formatDateTime, truncateHash } from "@/lib/utils";

type DecisionBadgeVariant = "success" | "warning" | "destructive" | "neutral";

const statusConfig: Record<
  PolicyStatus,
  { label: string; variant: DecisionBadgeVariant }
> = {
  approved: { label: "Approved", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  rejected: { label: "Rejected", variant: "destructive" },
  draft: { label: "Draft", variant: "neutral" },
};

interface DecisionTableProps {
  decisions: PolicyDecision[];
}

export function DecisionTable({ decisions }: DecisionTableProps) {
  const [query, setQuery] = useState("");

  const filtered = decisions.filter(
    (d) =>
      d.id.toLowerCase().includes(query.toLowerCase()) ||
      d.policyRule.toLowerCase().includes(query.toLowerCase()) ||
      d.reviewer.toLowerCase().includes(query.toLowerCase()) ||
      d.framework.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by policy ID, rule, reviewer, or framework…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Policy ID</TableHead>
              <TableHead>Policy Rule</TableHead>
              <TableHead className="w-24">Framework</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-36">Reviewer</TableHead>
              <TableHead className="w-40">Timestamp</TableHead>
              <TableHead className="w-40">Evidence Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No policy decisions match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((decision) => {
                const status = statusConfig[decision.status];
                return (
                  <TableRow key={decision.id}>
                    <TableCell className="font-mono text-xs font-medium">{decision.id}</TableCell>
                    <TableCell className="text-sm">{decision.policyRule}</TableCell>
                    <TableCell>
                      <Badge variant="info" className="text-xs">
                        {decision.framework}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="text-xs">
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{decision.reviewer}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(decision.timestamp)}
                    </TableCell>
                    <TableCell>
                      {decision.evidenceHash ? (
                        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          {truncateHash(decision.evidenceHash.replace("sha256:", ""))}
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
