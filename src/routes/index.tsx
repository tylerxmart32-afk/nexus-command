import { createFileRoute } from "@tanstack/react-router";

import { FleetOverview } from "@/components/nexus/FleetOverview";
import { LoginScreen } from "@/components/nexus/LoginScreen";
import { NexusShell } from "@/components/nexus/NexusShell";
import { useAuth } from "@/lib/nexus/auth";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Fleet — NEXUS" },
      { name: "description", content: "NEXUS Command Deck fleet overview." },
      { property: "og:title", content: "Fleet — NEXUS" },
      { property: "og:description", content: "NEXUS Command Deck fleet overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <NexusShell>
      <FleetOverview />
    </NexusShell>
  );
}
