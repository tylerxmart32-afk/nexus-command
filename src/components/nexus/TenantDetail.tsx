import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  tenantEventsQueryOptions,
  tenantHealthHistoryQueryOptions,
  tenantKpisQueryOptions,
  tenantsQueryOptions,
} from "@/lib/nexus/queries";

import { ClientTurnsChart, CostChart, PipelineChart } from "./charts";
import { HealthStrip } from "./HealthStrip";
import { LiveFeed } from "./LiveFeed";
import { formatCurrency, HealthDot, MetricValue, PlanBadge, relativeTime } from "./ui-bits";

export function TenantDetail({ tenantId }: { tenantId: string }) {
  const [days, setDays] = useState<7 | 30>(7);
  const { data: tenants, isLoading: tenantsLoading } = useSuspenseQuery(tenantsQueryOptions());
  const { data: kpis, isLoading: kpisLoading } = useSuspenseQuery(tenantKpisQueryOptions(tenantId, days));
  const { data: healthHistory, isLoading: healthLoading } = useSuspenseQuery(
    tenantHealthHistoryQueryOptions(tenantId, 24),
  );
  const { data: events, isLoading: eventsLoading } = useSuspenseQuery(tenantEventsQueryOptions(tenantId, 20));

  const tenant = tenants.find((t) => t.id === tenantId);
  const latestKpi = kpis[kpis.length - 1] ?? null;
  const isLoading = tenantsLoading || kpisLoading || healthLoading || eventsLoading;

  if (!tenant && !tenantsLoading) {
    return (
      <div className="space-y-4">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to fleet
        </Link>
        <p className="text-muted-foreground">Tenant not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {tenant ? (
            <>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{tenant.display_name}</h1>
                <p className="text-sm text-muted-foreground">{tenant.agent_name}</p>
              </div>
              <PlanBadge plan={tenant.plan} />
              <HealthDot health={healthHistory?.[healthHistory.length - 1] ?? null} />
            </>
          ) : (
            <Skeleton className="h-8 w-40" />
          )}
        </div>

        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v) as 7 | 30)}>
          <TabsList className="bg-card">
            <TabsTrigger value="7">7 days</TabsTrigger>
            <TabsTrigger value="30">30 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricValue label="Contacts" value={latestKpi ? latestKpi.contacts.toLocaleString() : "—"} empty={!latestKpi} />
          <MetricValue label="Companies" value={latestKpi ? latestKpi.companies.toLocaleString() : "—"} empty={!latestKpi} />
          <MetricValue label="Deals open" value={latestKpi ? latestKpi.deals_open.toLocaleString() : "—"} empty={!latestKpi} />
          <MetricValue label="Deals won" value={latestKpi ? latestKpi.deals_won.toLocaleString() : "—"} empty={!latestKpi} />
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Health history</h2>
        {isLoading ? <Skeleton className="h-8 w-full" /> : <HealthStrip checks={healthHistory ?? []} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Client turns</h2>
          {isLoading ? <Skeleton className="h-48 w-full" /> : <ClientTurnsChart data={kpis ?? []} />}
        </div>
        <div className="space-y-2">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Pipeline</h2>
          {isLoading ? <Skeleton className="h-48 w-full" /> : <PipelineChart data={kpis ?? []} />}
        </div>
        <div className="space-y-2">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Cost</h2>
          {isLoading ? <Skeleton className="h-48 w-full" /> : <CostChart data={kpis ?? []} />}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Recent events</h2>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent events.</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {events.map((event) => (
              <div key={event.id} className="flex items-start justify-between p-3 text-xs">
                <div>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                    {event.event_type}
                  </span>
                  {event.event_type === "alert" && event.payload?.message && (
                    <p className="mt-1 text-danger-foreground">{event.payload.message}</p>
                  )}
                  {event.event_type === "jarvis_turn" && (
                    <p className="mt-1 text-muted-foreground">
                      {event.actor} · {event.payload?.tool_calls ?? 0} tool calls
                      {event.payload?.tool_errors ? ` · ${event.payload.tool_errors} errors` : ""}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">{relativeTime(event.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
