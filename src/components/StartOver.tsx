"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

import { useSession } from "@/lib/session";

/**
 * Global escape hatch, mounted in the root layout so it is reachable from every
 * screen including the frosted onboarding card (hence z-60, one above it).
 * Wipes the stored session and drops you back at sign-up — the demo is meant to
 * be re-run, and hunting for a reset inside the flow you are trying to restart
 * is the one thing that would make it annoying.
 *
 * Deliberately the ink pill rather than a card-coloured one: the first version
 * was `bg-card` with muted text, which put a white pill on the white composer
 * bar and made it invisible in the one place people look for it. It is a demo
 * control, not product chrome, so it is allowed to sit outside the palette.
 * `surface-inverse` stays dark in both themes.
 *
 * Cleared of the chat composer on phones (`bottom-20`), where the composer runs
 * full-width; on desktop the composer is a centred max-w-2xl and the corner is
 * free.
 */
export function StartOver() {
  const router = useRouter();
  const { reset } = useSession();

  return (
    <button
      type="button"
      onClick={() => {
        reset();
        router.push("/signup");
      }}
      className="bg-surface-inverse text-surface-inverse-foreground fixed right-4 bottom-20 z-60 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium shadow-lg ring-1 ring-black/10 transition hover:opacity-90 md:right-5 md:bottom-5"
    >
      <RotateCcw className="text-surface-inverse-accent size-3.5" aria-hidden />
      Start over
    </button>
  );
}
