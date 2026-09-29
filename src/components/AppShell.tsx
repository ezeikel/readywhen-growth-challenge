"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Inbox, LifeBuoy, Lock, MessageSquare, Repeat } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/helpers/utils";
import { isUnlocked, useSession } from "@/lib/session";
import { FOUND_COMMITMENTS, WORK_TOOLS } from "@/lib/content";

/**
 * Chat is the only surface at first. Inbox and 2nd Brain carry `unlocks: true`
 * and stay locked until a source is connected; Routines and Help are inert
 * throughout, so the chrome reads like the product without shipping two more
 * mock pages the challenge never asks anyone to touch.
 */
const NAV = [
  { href: "/inbox", label: "Inbox", icon: Inbox, unlocks: true },
  { href: "/chat", label: "Chat", icon: MessageSquare, unlocks: false },
  { href: "/brain", label: "2nd Brain", icon: Brain, unlocks: true },
  { href: null, label: "Routines", icon: Repeat, unlocks: false },
  { href: null, label: "Help", icon: LifeBuoy, unlocks: false },
];

/**
 * The signed-in chrome. `decorative` is the /welcome case: the product paints the
 * live board behind its frosted onboarding card rather than a hand-built replica,
 * so the surface never changes between steps.
 */
export function AppShell({
  children,
  decorative = false,
}: Readonly<{ children?: ReactNode; decorative?: boolean }>) {
  const pathname = usePathname();
  const { session } = useSession();
  const unlocked = isUnlocked(session);

  return (
    <div
      className={cn("bg-background flex min-h-svh", decorative && "pointer-events-none select-none")}
      aria-hidden={decorative || undefined}
      inert={decorative || undefined}
    >
      <aside className="bg-sidebar border-sidebar-border hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="border-sidebar-border flex h-14 items-center border-b px-5">
          <Image
            src="/logos/readywhen-lockup-on-light.webp"
            alt="readywhen"
            translate="no"
            className="notranslate"
            width={120}
            height={20}
            style={{ height: "auto" }}
            priority
          />
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {NAV.map((item) => {
            const open = item.href !== null && (!item.unlocks || unlocked);
            const className =
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors";

            if (!open) {
              return (
                <span
                  key={item.label}
                  // A locked row still announces *why* it is locked. Silently
                  // greying it out reads as broken rather than as "not yet".
                  title={item.unlocks ? "Unlocks once you connect a tool" : undefined}
                  className={cn(className, "text-muted-foreground opacity-40")}
                >
                  <item.icon className="size-4" aria-hidden />
                  <span className="flex-1">{item.label}</span>
                  {item.unlocks && <Lock className="size-3" aria-hidden />}
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href as string}
                className={cn(
                  className,
                  pathname.startsWith(item.href as string)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-sidebar-border border-t p-3">
          <p className="text-muted-foreground truncate px-3 text-xs">
            {session.email ?? "not signed in"}
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children ?? <Board />}</main>
    </div>
  );
}

/** The commitment board. Rendered for real at /inbox, and inert behind the
 *  onboarding card on /welcome — one component, so the backdrop can never drift
 *  from the board it is standing in for. */
export function Board() {
  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-season text-2xl font-semibold">Inbox</h2>
        <div className="flex -space-x-1.5">
          {WORK_TOOLS.slice(0, 4).map((tool) => (
            <span
              key={tool.slug}
              className="border-border bg-card grid size-7 place-items-center rounded-full border"
            >
              <img src={tool.iconSrc} alt="" className="size-3.5 object-contain" />
            </span>
          ))}
        </div>
      </div>
      <ul className="border-border divide-border bg-card divide-y overflow-hidden rounded-xl border shadow-xs">
        {FOUND_COMMITMENTS.map((item) => (
          <li key={item.title} className="flex items-center gap-3 px-4 py-3.5">
            <span className="border-input size-4 shrink-0 rounded border-2" aria-hidden />
            <span className="flex-1 text-sm font-medium">{item.title}</span>
            <span className="text-muted-foreground text-xs">{item.due}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The frosted card every pre-board onboarding step renders inside. */
export function OnboardingCard({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter: "blur(7px)",
        backgroundColor: "color-mix(in oklab, var(--foreground) 36%, transparent)",
      }}
    >
      <div className="bg-background flex max-h-[92dvh] w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-2xl border p-6 shadow-2xl sm:p-8">
        {children}
      </div>
    </div>
  );
}

/** The section heading Assets, Routines and Brain all use. */
export function Section({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <section className="mt-9">
      <h2 className="text-foreground mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}
