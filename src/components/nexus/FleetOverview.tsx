import { useSuspenseQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import {
  buildFleet,
  latestHealthQueryOptions,
  latestKpisQueryOptions,
  tenantsQueryOptions,
} from "@/lib/nexus/queries";
import { isHealthy } from "./ui-bits";

import { TenantCard } from "./TenantCard";
import { formatCurrency } from "./ui-bits";

function TotalsRow({ fleet }: { fleet: ReturnType<typeof buildFleet> }) {
  let pipeline = 0;
  let won = 0;
  let cost = 0;
  let healthy = 0;

  for (const t of fleet) {
    pipeline += t.latestKpi?.pipeline_usd ?? 0;
    won += t.latestKpi?.won_usd ?? 0;
    cost += t.latestKpi?.cost_usd ?? 0;
    if (isHealthy(t.latestHealth)) healthy += 1;
  }

  const total = fleet.length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pipeline</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(pipeline)}</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Won</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(won)}</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cost</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(cost)}</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Healthy</p>
        <p className="mt-1 text-lg font-semibold text-foreground">
          {healthy}/{total}
        </p>
      </div>
    </div>
  );
}

export function FleetOverview() {
  const { data: tenants, isLoading: tenantsLoading } = useSuspenseQuery(tenantsQueryOptions());
  const { data: healthRows, isLoading: healthLoading } = useSuspenseQuery(latestHealthQueryOptions());
  const { data: kpiRows, isLoading: kpiLoading } = useSuspenseQuery(latestKpisQueryOptions());

  const isLoading = tenantsLoading || healthLoading || kpiLoading;
  const fleet = buildFleet(tenants ?? [], healthRows ?? [], kpiRows ?? []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Fleet Overview</h1>
        <p className="text-sm text-muted-foreground">Live status across all managed tenants.</p>
      </div>

      {isLoading ? <Skeleton className="h-20 w-full" /> : <TotalsRow fleet={fleet} />}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : fleet.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No tenants found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fleet.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
}
