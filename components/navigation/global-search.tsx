"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { globalSearch, type SearchResult } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const results: SearchResult[] = React.useMemo(
    () => globalSearch(query),
    [query],
  );

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function select(r: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(r.href as never);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search policies, vendors, decisions…"
        className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {open && query.trim() && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-md border bg-card shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <button
                    onClick={() => select(r)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-accent",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {r.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {r.subtitle}
                      </span>
                    </span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                      {r.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
