import { createFileRoute } from "@tanstack/react-router";

import { TenantDetail } from "@/components/nexus/TenantDetail";

export const Route = createFileRoute("/_authenticated/tenant/$tenantId")({
  head: () => ({
    meta: [
      { title: "Tenant Detail — NEXUS" },
      { name: "description", content: "Detailed health, KPIs, and events for a NEXUS tenant." },
      { property: "og:title", content: "Tenant Detail — NEXUS" },
      { property: "og:description", content: "Detailed health, KPIs, and events for a NEXUS tenant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TenantDetailPage,
});

function TenantDetailPage() {
  const { tenantId } = Route.useParams();
  return <TenantDetail tenantId={tenantId} />;
}
