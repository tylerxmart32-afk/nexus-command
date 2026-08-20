import type { ReactElement } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { NexusKpiDaily } from "@/lib/nexus/types";

import { formatCompactCurrency } from "./ui-bits";

function ChartContainer({ children, empty }: { children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="h-48 w-full rounded-lg border border-border bg-card/50 p-3">
      {empty ? (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      )}
    </div>
  );
}

function formatDayLabel(value: string) {
  const date = new Date(value);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}

export function ClientTurnsChart({ data }: { data: NexusKpiDaily[] }) {
  const chartData = data.map((d) => ({ day: d.day, turns: d.client_turns }));
  const empty = chartData.length === 0;

  return (
    <ChartContainer empty={empty}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="day" tickFormatter={formatDayLabel} tick={{ fill: "#8a8f98", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#8a8f98", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "#141517", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px" }}
          itemStyle={{ color: "#ececf1", fontSize: 12 }}
          labelStyle={{ color: "#8a8f98", fontSize: 10 }}
          formatter={(value: number) => [value, "Client turns"]}
        />
        <Bar dataKey="turns" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function PipelineChart({ data }: { data: NexusKpiDaily[] }) {
  const chartData = data.map((d) => ({ day: d.day, pipeline: d.pipeline_usd }));
  const empty = chartData.length === 0;

  return (
    <ChartContainer empty={empty}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="day" tickFormatter={formatDayLabel} tick={{ fill: "#8a8f98", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#8a8f98", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompactCurrency(v)} />
        <Tooltip
          contentStyle={{ backgroundColor: "#141517", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px" }}
          itemStyle={{ color: "#ececf1", fontSize: 12 }}
          labelStyle={{ color: "#8a8f98", fontSize: 10 }}
          formatter={(value: number) => [formatCompactCurrency(value), "Pipeline"]}
        />
        <Line type="monotone" dataKey="pipeline" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}

export function CostChart({ data }: { data: NexusKpiDaily[] }) {
  const chartData = data.map((d) => ({ day: d.day, cost: d.cost_usd }));
  const empty = chartData.length === 0;

  return (
    <ChartContainer empty={empty}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="day" tickFormatter={formatDayLabel} tick={{ fill: "#8a8f98", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#8a8f98", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompactCurrency(v)} />
        <Tooltip
          contentStyle={{ backgroundColor: "#141517", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px" }}
          itemStyle={{ color: "#ececf1", fontSize: 12 }}
          labelStyle={{ color: "#8a8f98", fontSize: 10 }}
          formatter={(value: number) => [formatCompactCurrency(value), "Cost"]}
        />
        <Bar dataKey="cost" fill="hsl(var(--danger))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
