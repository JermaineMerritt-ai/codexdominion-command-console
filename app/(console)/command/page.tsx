import { PageHeader } from "@/components/page-header";
import { CommandWorkspace } from "@/components/command/command-workspace";
import { getCurrentActor } from "@/lib/auth/actor";
import { SUGGESTED_PROMPTS } from "@/lib/command/intents";

export const metadata = { title: "Command" };

export default async function CommandPage() {
  const actor = await getCurrentActor();

  return (
    <div>
      <PageHeader
        title="Command Workspace"
        description="Describe what you need. CodexDominion interprets the request, enforces governance, executes permitted actions, and records every step in the audit trail."
      />
      <CommandWorkspace role={actor.role} suggestions={SUGGESTED_PROMPTS} />
    </div>
  );
}
