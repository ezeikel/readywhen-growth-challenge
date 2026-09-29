"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppShell, Board } from "@/components/AppShell";
import { isUnlocked, useSession } from "@/lib/session";

/** The board, once there is something to put on it. Locked until a source is
 *  connected — reaching it early means a deep link, so it bounces to chat. */
export default function InboxPage() {
  const router = useRouter();
  const { session, ready } = useSession();

  useEffect(() => {
    if (!ready) return;
    if (!session.signedIn) router.replace("/signup");
    else if (!isUnlocked(session)) router.replace("/chat");
  }, [ready, session, router]);

  if (!ready || !session.signedIn || !isUnlocked(session)) return null;

  return (
    <AppShell>
      <Board />
    </AppShell>
  );
}
