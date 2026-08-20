import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/nexus/client";
import type { NexusEvent } from "@/lib/nexus/types";

export function useNexusRealtime(queryClient: QueryClient) {
  useEffect(() => {
    const channel = supabase
      .channel("nexus_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "nexus_events" },
        (payload) => {
          const newEvent = payload.new as NexusEvent;
          queryClient.setQueryData<NexusEvent[]>(["nexus", "events", 50], (old) => {
            if (!old) return [newEvent];
            if (old.some((e) => e.id === newEvent.id)) return old;
            return [newEvent, ...old].slice(0, 50);
          });
          queryClient.setQueryData<NexusEvent[]>(["nexus", "events", newEvent.tenant_id, 50], (old) => {
            if (!old) return [newEvent];
            if (old.some((e) => e.id === newEvent.id)) return old;
            return [newEvent, ...old].slice(0, 50);
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "nexus_health" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["nexus", "health"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "nexus_kpis_daily" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["nexus", "kpis"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "nexus_kpis_daily" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["nexus", "kpis"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
