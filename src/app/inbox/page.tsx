"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

import { AppShell, Board } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { failureReason, loadBoard } from "@/lib/board";
import { durationBucket, recordOnce, sinceConnectBucket } from "@/lib/funnel-events";
import { recordBusinessEvent } from "@/lib/metrics";
import { isUnlocked, useSession } from "@/lib/session";

const AUTO_RETRY_DELAY_MS = 1500;

/** The board, once there is something to put on it. Locked until a source is
 *  connected — reaching it early means a deep link, so it bounces to chat. */
export default function InboxPage() {
  const router = useRouter();
  const { session, ready } = useSession();
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [attempt, setAttempt] = useState(1);
  const via = useRef("sidebar");
  const unlocked = ready && session.signedIn && isUnlocked(session);

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
    try {
      const stored = window.sessionStorage.getItem("rwgc.inbox_via");
      if (stored) {
        via.current = stored;
        window.sessionStorage.removeItem("rwgc.inbox_via");
      }
    } catch {}
  }, [ready, session, router]);

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    setStatus("loading");

    loadBoard().then(
      () => {
        if (!cancelled) setStatus("ready");
      },
      (error: unknown) => {
        if (cancelled) return;
        recordBusinessEvent("inbox.load_failed", {
          attempt: Math.min(attempt, 3),
          reason: failureReason(error),
          duration_bucket: durationBucket(Date.now() - startedAt),
        });
        if (attempt > 1) {
          setStatus("failed");
          return;
        }
        retryTimer = setTimeout(() => {
          recordBusinessEvent("inbox.load_retried", { attempt: 2, trigger: "auto" });
          setAttempt(2);
        }, AUTO_RETRY_DELAY_MS);
      },
    );

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, [unlocked, attempt]);

  useEffect(() => {
    if (status !== "ready") return;
    recordOnce("inbox.viewed", "inbox.viewed", {
      connected_count: session.connected.length,
      since_connect_bucket: sinceConnectBucket(session.firstConnectedAt),
      via: via.current,
      load_attempts: Math.min(attempt, 3),
    });
  }, [status, attempt, session.connected.length, session.firstConnectedAt]);

  if (!unlocked) return null;

  return (
    <AppShell>
      {status === "ready" && <Board />}
      {status === "loading" && (
        <div role="status" className="flex flex-col gap-5 p-8">
          <h2 className="font-season text-2xl font-semibold">Inbox</h2>
          <p className="text-muted-foreground text-sm">Loading your board…</p>
          <div className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs" aria-hidden>
            {[0, 1, 2].map((row) => (
              <div key={row} className="bg-muted h-4 animate-pulse rounded" />
            ))}
          </div>
        </div>
      )}
      {status === "failed" && (
        <div role="alert" className="flex flex-col items-start gap-4 p-8">
          <h2 className="font-season text-2xl font-semibold">Inbox</h2>
          <p className="text-sm">Your board didn't load. Your sources are still connected.</p>
          <Button
            type="button"
            variant="brand"
            onClick={() => {
              recordBusinessEvent("inbox.load_retried", {
                attempt: Math.min(attempt + 1, 3),
                trigger: "manual",
              });
              setAttempt(attempt + 1);
            }}
          >
            <RotateCcw aria-hidden />
            Retry
          </Button>
        </div>
      )}
    </AppShell>
  );
}
