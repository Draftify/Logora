import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";

function displayName(email: string): string {
  const local = email.split("@")[0] ?? email;
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return name || "there";
}

function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#05070d]" />
      <div className="absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-indigo-600/20 blur-[120px] animate-aurora" />
      <div className="absolute -right-40 top-1/4 h-[36rem] w-[36rem] rounded-full bg-fuchsia-600/15 blur-[120px] animate-aurora [animation-delay:-6s]" />
      <div className="absolute -bottom-40 left-1/3 h-[34rem] w-[34rem] rounded-full bg-cyan-500/15 blur-[120px] animate-aurora [animation-delay:-12s]" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = displayName(user.email);

  return (
    <div className="relative min-h-screen text-zinc-100">
      <BackgroundFX />
      <Sidebar email={user.email} />

      <main className="relative lg:pl-[272px]">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <TopBar name={name} />
          {children}

          <footer className="mt-12 border-t border-white/8 pb-8 pt-6 text-center text-xs text-zinc-600">
            Logora · real-time event analytics
          </footer>
        </div>
      </main>
    </div>
  );
}
