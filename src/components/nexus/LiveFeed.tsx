import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangle, Bot, MessageSquare } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsQueryOptions, tenantsQueryOptions } from "@/lib/nexus/queries";
import type { NexusEvent } from "@/lib/nexus/types";

import { relativeTime } from "./ui-bits";

function EventRow({ event, tenantName }: { event: NexusEvent; tenantName: string }) {
  const isAlert = event.event_type === "alert";
  const toolCalls = event.payload?.tool_calls ?? 0;
  const toolErrors = event.payload?.tool_errors ?? 0;

  return (
    <div
      className={`border-b border-border p-3 text-xs transition-colors hover:bg-accent/30 ${
        isAlert ? "bg-danger/5" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isAlert ? (
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
          ) : (
            <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="font-medium text-foreground">{tenantName}</span>
        </div>
        <span className="shrink-0 text-[10px] text-muted-foreground">{relativeTime(event.created_at)}</span>
      </div>

      <div className="mt-1.5 flex items-center gap-2 pl-5">
        <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${isAlert ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground"}`}>
          {event.event_type}
        </span>
        {!isAlert && (
          <span className="text-[10px] text-muted-foreground">{event.actor}</span>
        )}
      </div>

      {isAlert && event.payload?.message && (
        <p className="mt-1.5 pl-5 text-[11px] leading-relaxed text-danger-foreground">
          {event.payload.message}
        </p>
      )}

      {!isAlert && toolCalls > 0 && (
        <div className="mt-1.5 flex items-center gap-2 pl-5">
          <span className="text-[10px] text-muted-foreground">{toolCalls} tool calls</span>
          {toolErrors > 0 && (
            <span className="rounded bg-danger/10 px-1.5 py-0.5 text-[10px] text-danger">
              {toolErrors} error{toolErrors === 1 ? "" : "s"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function LiveFeed() {
  const { data: events, isLoading } = useSuspenseQuery(eventsQueryOptions(50));
  const { data: tenants } = useSuspenseQuery(tenantsQueryOptions());
  const tenantNames = new Map(tenants.map((t) => [t.id, t.display_name || t.tenant_key]));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-border px-4">
        <h2 className="text-sm font-medium text-foreground">Live Feed</h2>
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Waiting for events</p>
          </div>
        ) : (
          <div>
            {events.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                tenantName={tenantNames.get(event.tenant_id) ?? event.tenant_id.slice(0, 8)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
