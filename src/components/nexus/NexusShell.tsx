import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Activity, LogOut, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNexusRealtime } from "@/hooks/use-nexus-realtime";
import { useAuth } from "@/lib/nexus/auth";
import type { ReactNode } from "react";

import { LiveFeed } from "./LiveFeed";

export function NexusShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const queryClient = router.options.context?.queryClient;
  const [mobileFeedOpen, setMobileFeedOpen] = useState(false);

  if (queryClient) {
    useNexusRealtime(queryClient);
  }

  const handleLogout = async () => {
    if (queryClient) {
      await queryClient.cancelQueries();
      queryClient.clear();
    }
    await logout();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold tracking-tight text-foreground">
            NEXUS
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link
              to="/"
              activeProps={{ className: "text-foreground" }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Fleet
            </Link>
            <Link
              to="/margin"
              activeProps={{ className: "text-foreground" }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Margin
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground sm:inline">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileFeedOpen(true)}
            aria-label="Open activity feed"
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:flex" onClick={handleLogout}>
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign out
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 bg-card p-0">
              <div className="flex h-14 items-center border-b border-border px-4">
                <span className="text-lg font-semibold">NEXUS</span>
              </div>
              <nav className="flex flex-col gap-1 p-3">
                <Link
                  to="/"
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Fleet
                </Link>
                <Link
                  to="/margin"
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Margin
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-4 flex items-center rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign out
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>

        <aside className="hidden w-80 border-l border-border bg-card md:block">
          <LiveFeed />
        </aside>
      </div>

      <Sheet open={mobileFeedOpen} onOpenChange={setMobileFeedOpen}>
        <SheetContent side="right" className="w-80 bg-card p-0">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-medium">Live Feed</span>
            <Button variant="ghost" size="icon" onClick={() => setMobileFeedOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <LiveFeed />
        </SheetContent>
      </Sheet>
    </div>
  );
}
