export type NexusPlan = "starter" | "pro" | "enterprise" | "admin";

export type NexusTenant = {
  id: string;
  tenant_key: string;
  display_name: string;
  agent_name: string;
  plan: NexusPlan;
  status: string;
  created_at: string;
};

export type NexusEventType = "jarvis_turn" | "alert";

export type NexusEventPayload = {
  duration_ms?: number;
  tool_calls?: number;
  tool_errors?: number;
  status?: string;
  message?: string;
};

export type NexusEvent = {
  id: string;
  tenant_id: string;
  event_type: NexusEventType;
  actor: string;
  payload: NexusEventPayload;
  created_at: string;
};

export type NexusHealth = {
  id: string;
  tenant_id: string;
  checked_at: string;
  bot_alive: boolean;
  crm_healthy: boolean;
  tunnel_up: boolean;
  backup_age_hours: number;
  detail: Record<string, unknown>;
};

export type NexusKpiDaily = {
  tenant_id: string;
  day: string;
  turns: number;
  client_turns: number;
  tool_calls: number;
  tool_errors: number;
  contacts: number;
  companies: number;
  deals_open: number;
  deals_won: number;
  pipeline_usd: number;
  won_usd: number;
  cost_usd: number;
  last_client_msg_at: string | null;
  updated_at: string;
};

export type NexusUsage = {
  tenant_id: string;
  day: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
};

export type FleetTenant = NexusTenant & {
  latestKpi: NexusKpiDaily | null;
  latestHealth: NexusHealth | null;
};
