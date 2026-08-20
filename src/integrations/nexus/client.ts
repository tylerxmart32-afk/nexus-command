import { createClient } from "@supabase/supabase-js";

import type {
  NexusEvent,
  NexusHealth,
  NexusKpiDaily,
  NexusTenant,
  NexusUsage,
} from "@/lib/nexus/types";

const SUPABASE_URL = "https://xcxonrnodmzjsfyjutmt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjeG9ucm5vZG16anNmeWp1dG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzQ2OTEsImV4cCI6MjA5MDg1MDY5MX0.8suLnsqszfQSVLCFbfPGIQdfza1ZJ6at-39FGTstyIE";

export type Database = {
  public: {
    Tables: {
      nexus_tenants: {
        Row: NexusTenant;
        Insert: never;
        Update: never;
      };
      nexus_events: {
        Row: NexusEvent;
        Insert: never;
        Update: never;
      };
      nexus_health: {
        Row: NexusHealth;
        Insert: never;
        Update: never;
      };
      nexus_kpis_daily: {
        Row: NexusKpiDaily;
        Insert: never;
        Update: never;
      };
      nexus_usage: {
        Row: NexusUsage;
        Insert: never;
        Update: never;
      };
    };
  };
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
