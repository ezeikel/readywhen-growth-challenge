"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppShell, Board } from "@/components/AppShell";
import { recordOnce, sinceConnectBucket } from "@/lib/funnel-events";
import { isUnlocked, useSession } from "@/lib/session";

/** The board, once there is something to put on it. Locked until a source is
 *  connected — reaching it early means a deep link, so it bounces to chat. */
export default function InboxPage() {
  const router = useRouter();
  const { session, ready } = useSession();

  useEffect(() => {
    if (!ready) return;
    if (!session.signedIn) {
      recordOnce("inbox.bounced.signed_out", "inbox.bounced", { reason: "signed_out" });
      router.replace("/signup");
      return;
    }
    if (!isUnlocked(session)) {
      recordOnce("inbox.bounced.not_connected", "inbox.bounced", { reason: "not_connected" });
      router.replace("/chat");
      return;
    }
    let via = "sidebar";
    try {
      const stored = window.sessionStorage.getItem("rwgc.inbox_via");
      if (stored) {
        via = stored;
        window.sessionStorage.removeItem("rwgc.inbox_via");
      }
    } catch {
      // private mode: count the view, leave via as sidebar
    }
    recordOnce("inbox.viewed", "inbox.viewed", {
      connected_count: session.connected.length,
      since_connect_bucket: sinceConnectBucket(session.firstConnectedAt),
      via,
    });
  }, [ready, session, router]);

  if (!ready || !session.signedIn || !isUnlocked(session)) return null;

  return (
    <AppShell>
      <Board />
    </AppShell>
  );
}
