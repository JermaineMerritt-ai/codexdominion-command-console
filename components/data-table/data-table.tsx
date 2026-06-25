"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  type Row,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchPlaceholder?: string;
  pageSize?: number;
  renderExpanded?: (row: TData) => React.ReactNode;
  toolbar?: React.ReactNode;
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = "Search…",
  pageSize = 8,
  renderExpanded,
  toolbar,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => Boolean(renderExpanded),
    initialState: { pagination: { pageSize } },
    globalFilterFn: "includesString",
  });

  return (
    <div>
      <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {toolbar}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {renderExpanded && <th className="w-8" />}
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : sorted === "desc" ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (renderExpanded ? 1 : 0)}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No matching records.
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row: Row<TData>) => (
              <React.Fragment key={row.id}>
                <tr
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    renderExpanded && "cursor-pointer",
                  )}
                  onClick={
                    renderExpanded ? () => row.toggleExpanded() : undefined
                  }
                >
                  {renderExpanded && (
                    <td className="pl-3 text-muted-foreground">
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          row.getIsExpanded() && "rotate-90",
                        )}
                      />
                    </td>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
                {renderExpanded && row.getIsExpanded() && (
                  <tr className="bg-muted/30">
                    <td colSpan={row.getVisibleCells().length + 1} className="px-4 py-4">
                      {renderExpanded(row.original)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
        <span>
          {table.getFilteredRowModel().rows.length} record
          {table.getFilteredRowModel().rows.length === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
