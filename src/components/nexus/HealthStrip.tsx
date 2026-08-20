import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NexusHealth } from "@/lib/nexus/types";

import { isHealthy } from "./ui-bits";

export function HealthStrip({ checks }: { checks: NexusHealth[] }) {
  if (checks.length === 0) {
    return (
      <div className="flex h-8 items-center rounded-md border border-dashed border-border px-3 text-xs text-muted-foreground">
        No health checks yet
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={50}>
      <div className="flex h-8 items-center gap-0.5 rounded-md border border-border bg-card/50 p-1.5">
        {checks.map((check) => {
          const healthy = isHealthy(check);
          const backupWarning = check.backup_age_hours > 30;
          const color = healthy
            ? backupWarning
              ? "bg-warning"
              : "bg-success"
            : "bg-danger";

          return (
            <Tooltip key={check.id}>
              <TooltipTrigger asChild>
                <div className={`h-full flex-1 rounded-sm ${color} opacity-90 hover:opacity-100`} />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <div className="space-y-0.5">
                  <p>{new Date(check.checked_at).toLocaleString()}</p>
                  <p>Bot: {check.bot_alive ? "Alive" : "Down"}</p>
                  <p>CRM: {check.crm_healthy ? "Healthy" : "Unhealthy"}</p>
                  <p>Tunnel: {check.tunnel_up ? "Up" : "Down"}</p>
                  <p>Backup: {check.backup_age_hours}h</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
