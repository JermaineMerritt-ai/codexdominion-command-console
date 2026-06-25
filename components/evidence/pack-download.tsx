"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EvidencePack } from "@/types";

export function PackDownload({ pack }: { pack: EvidencePack }) {
  function download() {
    const blob = new Blob([JSON.stringify(pack, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pack.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={download}
      disabled={pack.status === "generating"}
    >
      <Download className="h-4 w-4" /> Export
    </Button>
  );
}
