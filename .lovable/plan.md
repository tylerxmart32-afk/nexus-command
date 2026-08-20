# NEXUS Command Deck

A dark, Linear-style operations dashboard over your existing Supabase project. No tables are created or modified — the app reads your live data and subscribes to realtime updates.

## Connection & auth

- Add `@supabase/supabase-js` and a browser client pointed at your project URL + publishable/anon key (safe to ship in client code; RLS does the enforcement).
- All data access happens client-side as the signed-in user, so RLS applies exactly as configured. No tenant filtering in app code, no service-role key, no server functions touching your data.
- Signed-out: a single centered login screen (email + password, inline validation, loading state). Signed-in: the full app shell. Session persists across reloads; sign-out button in the header.
- Since data is session-scoped, the app renders client-side after auth resolves rather than server-rendering rows.

## Layout

Persistent shell: slim top bar (NEXUS wordmark, nav: Fleet / Margin, signed-in email, sign out) with a Live Feed rail docked right on desktop. On mobile the feed collapses into a slide-over panel opened from a bell/activity button, and nav collapses to a compact row.

## 1. Fleet Overview (home, `/`)

- Loads `nexus_tenants` (excluding `tenant_key = 'operator'`), the latest `nexus_kpis_daily` row per tenant, and the latest `nexus_health` row per tenant, joined in the client.
- Totals row at top: sum pipeline_usd, sum won_usd, sum cost_usd, and "3/4 healthy".
- One card per tenant: display_name + plan badge, health dot (green when bot_alive AND crm_healthy, else red) with tooltip showing tunnel_up and backup_age_hours (amber when > 30), today's client_turns, deals_open + pipeline_usd, deals_won + won_usd, contacts, cost_usd.
- Amber "Quiet Nd" chip when `last_client_msg_at` is 5+ days old or null (N = whole days since last client message).
- Card click navigates to the tenant detail page.
- Empty state per metric group: "No data yet today" instead of zeros-as-charts.

## 2. Live Feed rail

- Realtime `postgres_changes` INSERT subscription on `nexus_events`, seeded with the most recent 50 rows on mount, newest first, capped at 50.
- Each row: tenant display name, event type, relative time ("2m ago").
- `jarvis_turn`: actor channel + tool_calls count, red badge when tool_errors > 0.
- `alert`: red-tinted row showing `payload.message`.
- Empty state: "Waiting for events".

## 3. Tenant Detail (`/tenant/$tenantId`)

- Header: display_name, agent_name, plan badge, live health dot.
- Default operator email for login: redridge.ai@gmail.com (password delivered separately).
- 7d / 30d toggle driving three Recharts panels from `nexus_kpis_daily`: client_turns per day (bar), pipeline_usd trend (line), cost_usd per day (bar). Days with no row render as gaps; a fully empty range shows "No data yet".
- Stat tiles: contacts, companies, deals_open, deals_won (latest day).
- Health history strip: last 24 `nexus_health` checks as colored ticks (green/red, amber when backup_age_hours > 30) with hover detail.
- Recent events list filtered to this tenant, live-updating.

## 4. Margin (`/margin`)

Table: tenant, plan, est. monthly revenue from a hardcoded, easy-to-edit map (starter $297, pro $597, enterprise $997; admin $0), month-to-date cost (sum of `cost_usd` across `nexus_kpis_daily` rows for the current month), margin $, margin %. Sorted by margin descending, with column sorting. Currency formatted `$260,000`.

## Realtime

One shared channel setup: INSERT on `nexus_events`, INSERT on `nexus_health`, INSERT + UPDATE on `nexus_kpis_daily`. Incoming rows patch the TanStack Query caches so fleet cards, health dots, charts, and the feed update without a refresh. Subscriptions are torn down on sign-out.

## Design

Dark-only theme (no toggle), Inter, near-black surfaces with subtle 1px borders, tight Linear-style density, semantic green/amber/red status tokens defined as CSS variables. Mobile-first: cards stack at 375px, charts scroll-safe, tables become stacked rows on small screens. Hover/focus states on every interactive element; skeletons while loading.

## Technical notes

- New: `src/integrations/nexus/client.ts` (Supabase browser client), query/realtime hooks in `src/hooks/`, presentational components in `src/components/nexus/`, routes `index.tsx`, `tenant.$tenantId.tsx`, `margin.tsx`, plus an auth gate component used by the shell.
- Types hand-written from your schema (no generated types available for an external project).
- Each route gets its own head() title/description.
- Charts use the already-installed Recharts; dates via date-fns.
