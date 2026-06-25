import { PageHeader } from "@/components/page-header";
import { CommandWorkspace } from "@/components/command/command-workspace";
import { getCurrentActor } from "@/lib/auth/actor";
import { PLAN_SUGGESTIONS } from "@/lib/execution/plans";
import { PROVIDER_INFO } from "@/lib/providers/registry";

export const metadata = { title: "Command" };

// A focused, demo-ready set (the full command vocabulary still works by typing).
const CURATED_COMMANDS = [
  "Show high-risk decisions",
  "Show pending approvals",
  "Review system risk posture",
  "Show vendors with expiring certifications",
  "Show active modules",
  "Show highest risk module",
  "Show payment approval risks",
  "Show organization knowledge graph",
  "Recommend next governance action",
];

export default async function CommandPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [actor, params] = await Promise.all([getCurrentActor(), searchParams]);
  const initialPrompt = typeof params.q === "string" ? params.q : "";

  return (
    <div>
      <PageHeader
        title="Command Workspace"
        description="Describe what you need. CodexDominion governs the request — parses intent, enforces permissions, audits every step — then routes execution to the selected AI provider."
      />
      <CommandWorkspace
        role={actor.role}
        suggestions={CURATED_COMMANDS}
        planSuggestions={PLAN_SUGGESTIONS}
        providers={PROVIDER_INFO}
        initialPrompt={initialPrompt}
      />
    </div>
  );
}
