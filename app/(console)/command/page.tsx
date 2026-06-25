import { PageHeader } from "@/components/page-header";
import { CommandWorkspace } from "@/components/command/command-workspace";
import { getCurrentActor } from "@/lib/auth/actor";
import { SUGGESTED_PROMPTS } from "@/lib/command/intents";
import { PLAN_SUGGESTIONS } from "@/lib/execution/plans";
import { PROVIDER_INFO } from "@/lib/providers/registry";

export const metadata = { title: "Command" };

export default async function CommandPage() {
  const actor = await getCurrentActor();

  return (
    <div>
      <PageHeader
        title="Command Workspace"
        description="Describe what you need. CodexDominion governs the request — parses intent, enforces permissions, audits every step — then routes execution to the selected AI provider."
      />
      <CommandWorkspace
        role={actor.role}
        suggestions={SUGGESTED_PROMPTS}
        planSuggestions={PLAN_SUGGESTIONS}
        providers={PROVIDER_INFO}
      />
    </div>
  );
}
