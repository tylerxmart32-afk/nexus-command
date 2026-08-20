# Nexus Command

Build "NEXUS Command Deck" — a dark, Linear-style operations dashboard for managing a fleet of AI-agent CRM tenants. Connect to my existing Supabase project (do NOT create tables — they exist and already contain live data).

**Supabase connection**
- URL: `https://xcxonrnodmzjsfyjutmt.supabase.co`
- anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjeG9ucm5vZG16anNmeWp1dG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzQ2OTEsImV4cCI6MjA5MDg1MDY5MX0.8suLnsqszfQSVLCFbfPGIQdfza1ZJ6at-39FGTstyIE`
- Auth: Supabase email+password login (a user already exists). Show a login screen when signed out; everything else requires a session. Row-Level Security is already configured server-side — signed-out/anon queries return zero rows by design, so do not add any client-side filtering by tenant.

**Existing tables (read-only from this app):**
- `nexus_tenants`: id (uuid), tenant_key (text), display_name, agent_name, plan (starter|pro|enterprise|admin), status, created_at. Exclude the `operator` tenant_key row from fleet views.
- `nexus_events`: id, tenant_id → nexus_tenants.id, event_type ('jarvis_turn' | 'alert'), actor (channel, e.g. telegram/autonomous), payload (jsonb: duration_ms, tool_calls, tool_errors, status | message), created_at. **Realtime is enabled** — subscribe to INSERTs.
- `nexus_health`: id, tenant_id, checked_at, bot_alive (bool), crm_healthy (bool), tunnel_up (bool), backup_age_hours (numeric), detail (jsonb). Realtime enabled. Latest row per tenant = current status.
- `nexus_kpis_daily`: tenant_id, day (date), turns, client_turns, tool_calls, tool_errors, contacts, companies, deals_open, deals_won, pipeline_usd, won_usd, cost_usd, last_client_msg_at (timestamptz), updated_at. One row per tenant per day. Realtime enabled.
- `nexus_usage`: tenant_id, day, model, input_tokens, output_tokens, cost_usd.

**Pages / layout:**

1. **Fleet Overview (home)** — one card per tenant (join nexus_tenants + latest nexus_kpis_daily + latest nexus_health):
   - display_name + plan badge
   - health dot: green if bot_alive AND crm_healthy (latest health row), red otherwise; tooltip shows tunnel_up + backup_age_hours (amber warning if backup_age_hours > 30)
   - today's client_turns, deals_open with pipeline_usd, deals_won with won_usd, contacts, cost_usd
   - **churn-risk flag**: amber "Quiet Nd" chip when last_client_msg_at is 5+ days ago (or null)
   - click → tenant detail page
   Top of page: fleet totals row (sum pipeline_usd, sum won_usd, sum cost_usd, count of healthy tenants like "3/4 healthy").

2. **Live Feed (right sidebar, always visible)** — Realtime subscription to nexus_events INSERTs: newest first, tenant name + event_type + relative time; 'jarvis_turn' rows show actor channel + tool_calls (+ red badge if tool_errors > 0); 'alert' rows highlighted red with payload.message. Keep last 50.

3. **Tenant Detail** — 7-day and 30-day toggle line/bar charts from nexus_kpis_daily (client_turns per day, pipeline_usd trend, cost_usd per day); stat tiles for contacts/companies/deals_open/deals_won; health history strip (last 24 checks as colored ticks); recent events list filtered to this tenant.

4. **Margin view** — table: tenant, plan, est. monthly revenue by plan (starter $297, pro $597, enterprise $997 — hardcode, I'll adjust), month-to-date cost_usd (sum), margin $ and %. Sort by margin.

**Design**: dark theme default, Linear/Notion aesthetic, Inter font, subtle borders, green/amber/red status dots, currency formatted like $260,000. Responsive — usable on my phone. Empty states that say "no data yet today" instead of blank charts.

**Realtime**: use supabase-js channel subscriptions on postgres_changes INSERT for nexus_events and nexus_health, and UPDATE/INSERT for nexus_kpis_daily, so cards and the feed update without refresh.

---

## After it builds
1. Log in with the operator email (tylerxmart32@gmail.com) and the password delivered separately (change it after first login).
2. If charts are empty: data starts accruing daily; the backend loop writes health every 15 min and rolls up KPIs daily at 8 AM (digest also lands on Telegram).
3. The `sb_publishable_...` key can replace the anon key later (Settings → API) — either works.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f436a558-2553-4553-8a9c-4d9c53c7722b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
