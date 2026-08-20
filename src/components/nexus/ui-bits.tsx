import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NexusHealth, NexusKpiDaily, NexusPlan } from "@/lib/nexus/types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function relativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isHealthy(health: NexusHealth | null): boolean {
  return health !== null && health.bot_alive && health.crm_healthy;
}

export function planBadgeColor(plan: NexusPlan): string {
  switch (plan) {
    case "starter":
      return "bg-muted text-muted-foreground border-border";
    case "pro":
      return "bg-primary/10 text-primary border-primary/20";
    case "enterprise":
      return "bg-success/10 text-success border-success/20";
    case "admin":
      return "bg-warning/10 text-warning border-warning/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function PlanBadge({ plan }: { plan: NexusPlan }) {
  return (
    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${planBadgeColor(plan)}`}>
      {plan}
    </Badge>
  );
}

export function HealthDot({ health }: { health: NexusHealth | null }) {
  const healthy = isHealthy(health);
  const backupWarning = (health?.backup_age_hours ?? 0) > 30;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              healthy ? "bg-success" : "bg-danger"
            } ${backupWarning ? "ring-1 ring-warning ring-offset-1 ring-offset-background" : ""}`}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          <div className="space-y-1">
            <p>
              <span className="text-muted-foreground">Bot:</span>{" "}
              {health?.bot_alive ? "Alive" : "Down"}
            </p>
            <p>
              <span className="text-muted-foreground">CRM:</span>{" "}
              {health?.crm_healthy ? "Healthy" : "Unhealthy"}
            </p>
            <p>
              <span className="text-muted-foreground">Tunnel:</span>{" "}
              {health?.tunnel_up ? "Up" : "Down"}
            </p>
            <p>
              <span className="text-muted-foreground">Backup:</span>{" "}
              {health?.backup_age_hours ?? "—"}h
              {backupWarning ? " (stale)" : ""}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function QuietChip({ kpi }: { kpi: NexusKpiDaily | null }) {
  if (!kpi?.last_client_msg_at) {
    return (
      <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
        Quiet —
      </span>
    );
  }

  const days = Math.floor(
    (Date.now() - new Date(kpi.last_client_msg_at).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days < 5) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
      Quiet {days}d
    </span>
  );
}

export function MetricValue({
  label,
  value,
  subValue,
  empty,
}: {
  label: string;
  value: string;
  subValue?: string | undefined;
  empty?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${empty ? "text-muted-foreground" : "text-foreground"}`}>
        {empty ? "No data yet today" : value}
      </span>
      {subValue && !empty && <span className="text-xs text-muted-foreground">{subValue}</span>}
    </div>
  );
}
