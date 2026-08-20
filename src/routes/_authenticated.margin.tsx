import { createFileRoute } from "@tanstack/react-router";

import { MarginView } from "@/components/nexus/MarginView";

export const Route = createFileRoute("/_authenticated/margin")({
  head: () => ({
    meta: [
      { title: "Margin — NEXUS" },
      { name: "description", content: "Per-tenant revenue, cost, and margin analysis." },
      { property: "og:title", content: "Margin — NEXUS" },
      { property: "og:description", content: "Per-tenant revenue, cost, and margin analysis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MarginPage,
});

function MarginPage() {
  return <MarginView />;
}
