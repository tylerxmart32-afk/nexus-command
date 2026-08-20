import { Link } from "@tanstack/react-router";

import { Card, CardContent } from "@/components/ui/card";
import type { FleetTenant } from "@/lib/nexus/types";

import {
  formatCompactCurrency,
  formatCurrency,
  HealthDot,
  MetricValue,
  PlanBadge,
  QuietChip,
} from "./ui-bits";

export function TenantCard({ tenant }: { tenant: FleetTenant }) {
  const kpi = tenant.latestKpi;
  const health = tenant.latestHealth;
  const hasKpi = kpi !== null;

  return (
    <Link to="/tenant/$tenantId" params={{ tenantId: tenant.id }}>
      <Card className="h-full cursor-pointer border-border bg-card transition-colors hover:border-primary/30 hover:bg-accent/20">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">{tenant.display_name}</h3>
              <p className="truncate text-xs text-muted-foreground">{tenant.agent_name}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <HealthDot health={health} />
              <PlanBadge plan={tenant.plan} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <QuietChip kpi={kpi} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <MetricValue
              label="Client turns"
              value={hasKpi ? kpi.client_turns.toLocaleString() : "—"}
              empty={!hasKpi}
            />
            <MetricValue
              label="Pipeline"
              value={hasKpi ? formatCompactCurrency(kpi.pipeline_usd) : "—"}
              subValue={hasKpi ? `${kpi.deals_open} open` : undefined}
              empty={!hasKpi}
            />
            <MetricValue
              label="Won"
              value={hasKpi ? formatCompactCurrency(kpi.won_usd) : "—"}
              subValue={hasKpi ? `${kpi.deals_won} won` : undefined}
              empty={!hasKpi}
            />
            <MetricValue
              label="Contacts"
              value={hasKpi ? kpi.contacts.toLocaleString() : "—"}
              empty={!hasKpi}
            />
            <MetricValue
              label="Cost"
              value={hasKpi ? formatCurrency(kpi.cost_usd) : "—"}
              empty={!hasKpi}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
