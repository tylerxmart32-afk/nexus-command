import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { marginQueryOptions } from "@/lib/nexus/queries";
import type { NexusPlan } from "@/lib/nexus/types";

import { formatCurrency, PlanBadge } from "./ui-bits";

type SortKey = "revenue" | "cost" | "margin" | "marginPercent";

export function MarginView() {
  const { data } = useSuspenseQuery(marginQueryOptions());
  const [sort, setSort] = useState<SortKey>("margin");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const rows = [...data];
    rows.sort((a, b) => {
      const diff = a[sort] - b[sort];
      return dir === "asc" ? diff : -diff;
    });
    return rows;
  }, [data, sort, dir]);

  const toggleSort = (key: SortKey) => {
    if (sort === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir("desc");
    }
  };

  const SortButton = ({ column, children }: { column: SortKey; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" className="h-auto px-0 py-0 font-medium" onClick={() => toggleSort(column)}>
      {children}
      {sort === column && <span className="ml-1 text-[10px]">{dir === "asc" ? "↑" : "↓"}</span>}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Margin</h1>
        <p className="text-sm text-muted-foreground">Estimated monthly revenue vs. month-to-date cost.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider">Tenant</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Plan</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">
                <SortButton column="revenue">Est. Revenue</SortButton>
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">
                <SortButton column="cost">MTD Cost</SortButton>
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">
                <SortButton column="margin">Margin $</SortButton>
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider">
                <SortButton column="marginPercent">Margin %</SortButton>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.tenant.id} className="hover:bg-accent/20">
                <TableCell className="font-medium text-foreground">{row.tenant.display_name}</TableCell>
                <TableCell>
                  <PlanBadge plan={row.tenant.plan as NexusPlan} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(row.revenue)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(row.cost)}</TableCell>
                <TableCell
                  className={`text-right tabular-nums ${row.margin >= 0 ? "text-success" : "text-danger"}`}
                >
                  {formatCurrency(row.margin)}
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums ${row.margin >= 0 ? "text-success" : "text-danger"}`}
                >
                  {row.marginPercent.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No tenant data yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
