"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { AppShell, OnboardingCard } from "@/components/AppShell";
import { ConsentDialog } from "@/components/ConsentDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  promiseDraft,
  recommendedConnector,
  type Tool,
} from "@/lib/content";
import { FIRST_SESSION, useExperiment } from "@/lib/experiments";
import { durationBucket, recordOnce } from "@/lib/funnel-events";
import { recordBusinessEvent } from "@/lib/metrics";
import { useSession } from "@/lib/session";

export default function StartPage() {
  const router = useRouter();
  const { session, ready, update } = useSession();
  const { variant, ready: armReady } = useExperiment(FIRST_SESSION);
  const [draftText, setDraftText] = useState("");
  const [pending, setPending] = useState<Tool | null>(null);
  const started = useRef(Date.now());
  const consentOpenedAt = useRef<number | null>(null);
  const lastAction = useRef("ask");
  const left = useRef(false);
  const connectedCount = useRef(0);
  connectedCount.current = session.connected.length;

  const saved = session.ownPromise.trim();
  const phase = saved === "" ? "ask" : "board";

  useEffect(() => {
    if (!ready || !armReady) return;
    if (!session.signedIn) router.replace("/signup");
    else if (variant === "control") router.replace("/welcome");
  }, [ready, armReady, session.signedIn, variant, router]);

  useEffect(() => {
    if (!ready || !session.signedIn || variant !== "promise-first") return;
    const onPageHide = () => {
      if (left.current || connectedCount.current > 0) return;
      left.current = true;
      recordBusinessEvent("start.left", {
        duration_bucket: durationBucket(Date.now() - started.current),
        last_action: lastAction.current,
      });
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [ready, session.signedIn, variant]);

  useEffect(() => {
    if (phase !== "board") return;
    lastAction.current = "board";
    recordOnce("promise.board_previewed", "promise.board_previewed");
    recordOnce("draft.shown.start", "draft.shown", { surface: "start" });
  }, [phase]);

  if (!ready || !armReady || !session.signedIn || variant !== "promise-first") return null;

  const gmail = recommendedConnector(null);
  const calendar = recommendedConnector("work-stuck-waiting-on-someone");
  const alreadyConnected = session.connected.length > 0;

  const pick = (tool: Tool) => {
    lastAction.current = "picked";
    consentOpenedAt.current = Date.now();
    recordBusinessEvent("connector.picked", { slug: tool.slug, surface: "start" });
    setPending(tool);
  };

  const allow = (tool: Tool) => {
    const first = session.connected.length === 0;
    left.current = true;
    setPending(null);
    update({
      connected: [...session.connected, tool.slug],
      firstConnectedAt: first ? Date.now() : session.firstConnectedAt,
    });
    recordBusinessEvent("connector.connected", {
      slug: tool.slug,
      surface: "start",
      is_first: first ? 1 : 0,
      connected_count: session.connected.length + 1,
      duration_bucket: durationBucket(Date.now() - started.current),
    });
    try {
      window.sessionStorage.setItem("rwgc.inbox_via", "start");
    } catch {}
    router.push("/inbox");
  };

  if (phase === "ask") {
    return (
      <>
        <AppShell decorative />
        <OnboardingCard>
          <Image
            src="/logos/readywhen-lockup-on-light.webp"
            alt="readywhen"
            translate="no"
            className="notranslate"
            width={132}
            height={22}
            style={{ height: "auto" }}
            priority
          />
          <form
            className="flex w-full flex-col"
            style={{ gap: "2.5rem" }}
            onSubmit={(event) => {
              event.preventDefault();
              const trimmed = draftText.trim();
              if (!trimmed) return;
              recordBusinessEvent("promise.submitted", {
                duration_bucket: durationBucket(Date.now() - started.current),
                length_bucket: trimmed.length < 40 ? "short" : "long",
              });
              update({ ownPromise: trimmed });
            }}
          >
            <header className="flex flex-col gap-2">
              <h1 className="font-season text-foreground text-3xl leading-tight font-semibold sm:text-4xl">
                What did you last tell a client you'd do?
              </h1>
              <p className="text-muted-foreground max-w-prose text-base">
                One promise is enough. I'll put it on your board and draft the reply, before I ask
                for anything else.
              </p>
            </header>
            <Textarea
              autoFocus
              rows={3}
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              placeholder="Send Tom the invoice for June"
              aria-label="What you told a client you'd do"
            />
            <div className="flex justify-end">
              <Button type="submit" variant="brand" disabled={draftText.trim() === ""} className="group">
                Put it on the board
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Button>
            </div>
          </form>
        </OnboardingCard>
      </>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-season text-3xl leading-tight font-semibold sm:text-4xl">Inbox</h1>
          <p className="text-muted-foreground text-base">One promise so far. The draft is underneath.</p>
        </header>

        <ul className="border-border divide-border bg-card divide-y overflow-hidden rounded-xl border shadow-xs">
          <li className="flex items-center gap-3 px-4 py-3.5">
            <span className="border-input size-4 shrink-0 rounded border-2" aria-hidden />
            <span className="flex-1 text-sm font-medium">{saved}</span>
            <span className="text-muted-foreground text-xs">you added this</span>
          </li>
        </ul>

        <div className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs">
          <p className="text-muted-foreground font-mono text-xs tracking-wide uppercase">Draft reply</p>
          <p className="text-sm leading-relaxed whitespace-pre-line">{promiseDraft(saved)}</p>
        </div>

        <div className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs">
          {alreadyConnected ? (
            <>
              <p className="text-sm font-medium">That's on your board.</p>
              <Button type="button" variant="brand" className="w-fit" onClick={() => router.push("/inbox")}>
                Open your board
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">That's one. The rest are in Gmail.</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Connect Gmail and I'll add what I find from the last 30 days. I still won't send
                anything.
              </p>
              <Button type="button" variant="brand" className="w-fit" onClick={() => pick(gmail)}>
                <img src={gmail.iconSrc} alt="" className="size-4 object-contain" />
                Connect Gmail
              </Button>
              <button
                type="button"
                className="text-muted-foreground w-fit text-left text-xs underline underline-offset-2"
                onClick={() => pick(calendar)}
              >
                Use Calendar instead
              </button>
            </>
          )}
        </div>
      </div>

      {pending && (
        <ConsentDialog
          tool={pending}
          onCancel={() => {
            const openFor = consentOpenedAt.current === null ? 0 : Date.now() - consentOpenedAt.current;
            lastAction.current = "consent_cancelled";
            recordBusinessEvent("connector.consent_cancelled", {
              slug: pending.slug,
              surface: "start",
              duration_bucket: durationBucket(openFor),
            });
            setPending(null);
          }}
          onAllow={() => allow(pending)}
        />
      )}
    </AppShell>
  );
}
