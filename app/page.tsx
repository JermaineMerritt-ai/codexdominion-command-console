import { redirect } from "next/navigation";

export default function Home() {
  // The Command Workspace is the primary interface for CodexDominion.
  redirect("/command");
}
