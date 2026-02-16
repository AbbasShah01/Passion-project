import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isDemoModeServer } from "@/lib/runtime-config";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DashboardNav from "./_components/dashboard-nav";
import LogoutButton from "./_components/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const demoMode = isDemoModeServer();

  if (!demoMode) {
    const supabase = createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect("/auth/login");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-gradient-to-r from-primary via-violet-600 to-secondary">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/80">Trend Generator</p>
            <h1 className="text-xl font-semibold">Creator Dashboard</h1>
            {demoMode ? (
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-pink-100">
                Demo Mode (no auth)
              </p>
            ) : null}
          </div>
          <div className="md:hidden">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-6">
        <div className="md:hidden">
          <DashboardNav mobile />
        </div>

        <div className="mt-4 grid gap-6 md:mt-0 md:grid-cols-[240px_1fr]">
          <aside className="hidden md:flex md:flex-col md:rounded-2xl md:border md:border-white/10 md:bg-white/5 md:p-4 md:backdrop-blur">
            <DashboardNav />
            <div className="mt-auto pt-4">
              <LogoutButton />
            </div>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
