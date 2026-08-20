import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/nexus/client";

import type {
  FleetTenant,
  NexusEvent,
  NexusHealth,
  NexusKpiDaily,
  NexusTenant,
  NexusUsage,
} from "./types";

const OPERATOR_KEY = "operator";

function mapSupabaseError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export const tenantsQueryOptions = () =>
  queryOptions({
    queryKey: ["nexus", "tenants"],
    queryFn: async (): Promise<NexusTenant[]> => {
      const { data, error } = await supabase
        .from("nexus_tenants")
        .select("*")
        .neq("tenant_key", OPERATOR_KEY)
        .order("display_name", { ascending: true });
      mapSupabaseError(error);
      return (data ?? []) as NexusTenant[];
    },
  });

export const latestHealthQueryOptions = () =>
  queryOptions({
    queryKey: ["nexus", "health", "latest"],
    queryFn: async (): Promise<NexusHealth[]> => {
      const { data, error } = await supabase
        .from("nexus_health")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(1000);
      mapSupabaseError(error);
      const rows = (data ?? []) as NexusHealth[];
      const byTenant = new Map<string, NexusHealth>();
      for (const row of rows) {
        if (!byTenant.has(row.tenant_id)) {
          byTenant.set(row.tenant_id, row);
        }
      }
      return Array.from(byTenant.values());
    },
  });

export const latestKpisQueryOptions = () =>
  queryOptions({
    queryKey: ["nexus", "kpis", "latest"],
    queryFn: async (): Promise<NexusKpiDaily[]> => {
      const { data, error } = await supabase
        .from("nexus_kpis_daily")
        .select("*")
        .order("day", { ascending: false })
        .limit(2000);
      mapSupabaseError(error);
      const rows = (data ?? []) as NexusKpiDaily[];
      const byTenant = new Map<string, NexusKpiDaily>();
      for (const row of rows) {
        if (!byTenant.has(row.tenant_id)) {
          byTenant.set(row.tenant_id, row);
        }
      }
      return Array.from(byTenant.values());
    },
  });

export function buildFleet(
  tenants: NexusTenant[],
  healthRows: NexusHealth[],
  kpiRows: NexusKpiDaily[],
): FleetTenant[] {
  const healthByTenant = new Map(healthRows.map((h) => [h.tenant_id, h]));
  const kpiByTenant = new Map(kpiRows.map((k) => [k.tenant_id, k]));

  return tenants.map((tenant) => ({
    ...tenant,
    latestHealth: healthByTenant.get(tenant.id) ?? null,
    latestKpi: kpiByTenant.get(tenant.id) ?? null,
  }));
}

export const eventsQueryOptions = (limit = 50) =>
  queryOptions({
    queryKey: ["nexus", "events", limit],
    queryFn: async (): Promise<NexusEvent[]> => {
      const { data, error } = await supabase
        .from("nexus_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      mapSupabaseError(error);
      return (data ?? []) as NexusEvent[];
    },
  });

export const tenantKpisQueryOptions = (tenantId: string, days: number) =>
  queryOptions({
    queryKey: ["nexus", "kpis", tenantId, days],
    queryFn: async (): Promise<NexusKpiDaily[]> => {
      const since = new Date();
      since.setUTCDate(since.getUTCDate() - days);
      since.setUTCHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("nexus_kpis_daily")
        .select("*")
        .eq("tenant_id", tenantId)
        .gte("day", since.toISOString().slice(0, 10))
        .order("day", { ascending: true });
      mapSupabaseError(error);
      return (data ?? []) as NexusKpiDaily[];
    },
  });

export const tenantHealthHistoryQueryOptions = (tenantId: string, limit = 24) =>
  queryOptions({
    queryKey: ["nexus", "health", tenantId, limit],
    queryFn: async (): Promise<NexusHealth[]> => {
      const { data, error } = await supabase
        .from("nexus_health")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("checked_at", { ascending: false })
        .limit(limit);
      mapSupabaseError(error);
      return ((data ?? []) as NexusHealth[]).sort(
        (a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime(),
      );
    },
  });

export const tenantEventsQueryOptions = (tenantId: string, limit = 50) =>
  queryOptions({
    queryKey: ["nexus", "events", tenantId, limit],
    queryFn: async (): Promise<NexusEvent[]> => {
      const { data, error } = await supabase
        .from("nexus_events")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(limit);
      mapSupabaseError(error);
      return (data ?? []) as NexusEvent[];
    },
  });

export const marginQueryOptions = () =>
  queryOptions({
    queryKey: ["nexus", "margin"],
    queryFn: async (): Promise<
      Array<{
        tenant: NexusTenant;
        revenue: number;
        cost: number;
        margin: number;
        marginPercent: number;
      }>
    > => {
      const [{ data: tenantsData, error: tenantsError }, { data: kpisData, error: kpisError }] =
        await Promise.all([
          supabase.from("nexus_tenants").select("*").neq("tenant_key", OPERATOR_KEY),
          supabase.from("nexus_kpis_daily").select("*"),
        ]);
      mapSupabaseError(tenantsError);
      mapSupabaseError(kpisError);

      const tenants = (tenantsData ?? []) as NexusTenant[];
      const kpis = (kpisData ?? []) as NexusKpiDaily[];

      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7);

      const revenueByPlan: Record<string, number> = {
        starter: 297,
        pro: 597,
        enterprise: 997,
        admin: 0,
      };

      const costByTenant = new Map<string, number>();
      for (const kpi of kpis) {
        if (!kpi.day.startsWith(currentMonth)) continue;
        costByTenant.set(kpi.tenant_id, (costByTenant.get(kpi.tenant_id) ?? 0) + (kpi.cost_usd ?? 0));
      }

      return tenants
        .map((tenant) => {
          const revenue = revenueByPlan[tenant.plan] ?? 0;
          const cost = costByTenant.get(tenant.id) ?? 0;
          const margin = revenue - cost;
          const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;
          return { tenant, revenue, cost, margin, marginPercent };
        })
        .sort((a, b) => b.margin - a.margin);
    },
  });

export const usageQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["nexus", "usage", tenantId],
    queryFn: async (): Promise<NexusUsage[]> => {
      const { data, error } = await supabase
        .from("nexus_usage")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("day", { ascending: false })
        .limit(30);
      mapSupabaseError(error);
      return (data ?? []) as NexusUsage[];
    },
  });
