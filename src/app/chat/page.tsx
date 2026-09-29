"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUp, Check, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { ConsentDialog } from "@/components/ConsentDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReadywhenName } from "@/components/ui/readywhen";
import { cn } from "@/helpers/utils";
import {
  CANNED_REPLIES,
  CONNECTORS,
  DRAFT_REPLY,
  FOUND_COMMITMENTS,
  connectAsk,
  openingLine,
  recommendedConnector,
  type Tool,
} from "@/lib/content";
import { durationBucket, recordOnce } from "@/lib/funnel-events";
import { recordBusinessEvent } from "@/lib/metrics";
import { useSession } from "@/lib/session";

/** Said once, the first time a source is connected. */
const UNLOCK_MESSAGE =
  "These are on your board now. Open it and work down the list. The 2nd Brain stays in the sidebar for when you want it.";

type Message =
  | { kind: "agent" | "user"; text: string }
  | { kind: "connect" }
  | { kind: "commitments" }
  | { kind: "draft" }
  | { kind: "board" };

export default function ChatPage() {
  const router = useRouter();
  const { session, ready, update } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<Tool | null>(null);
  const [sent, setSent] = useState(false);
  const [replyIndex, setReplyIndex] = useState(0);
  const bottom = useRef<HTMLDivElement>(null);
  const connectSeenAt = useRef<number | null>(null);
  const consentOpenedAt = useRef<number | null>(null);
  const connectLastAction = useRef("none");
  const connectLeft = useRef(false);
  const connectedCount = useRef(0);
  connectedCount.current = session.connected.length;

  useEffect(() => {
    if (ready && !session.signedIn) router.replace("/signup");
  }, [ready, session.signedIn, router]);

  useEffect(() => {
    if (!ready || !session.signedIn) return;
    recordOnce("chat.viewed", "chat.viewed");
    const onPageHide = () => {
      if (connectLeft.current || connectedCount.current > 0) return;
      connectLeft.current = true;
      const seenAt = connectSeenAt.current;
      recordBusinessEvent("chat.connect_left", {
        duration_bucket: durationBucket(seenAt === null ? 0 : Date.now() - seenAt),
        last_action: connectLastAction.current,
        saw_card: seenAt === null ? 0 : 1,
      });
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [ready, session.signedIn]);

  // The agent opens the conversation, then offers the connect card a beat later.
  // Deliberately idempotent rather than ref-guarded: React's dev StrictMode runs
  // the effect, tears it down, and runs it again, and a guarded version had its
  // timer cleared by that teardown — the connect card never appeared in dev.
  useEffect(() => {
    if (!ready || !session.signedIn) return;
    setMessages([{ kind: "agent", text: openingLine(session.jtbd, session.firstName) }]);
    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, { kind: "connect" }]);
      if (connectSeenAt.current === null) connectSeenAt.current = Date.now();
      if (connectLastAction.current === "none") connectLastAction.current = "card_seen";
      recordOnce("chat.connect_card_viewed", "chat.connect_card_viewed");
    }, 700);
    return () => clearTimeout(timer);
  }, [ready, session.signedIn, session.jtbd, session.firstName]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!ready || !session.signedIn) return null;

  function say(...added: Message[]) {
    setMessages((prev) => [...prev, ...added]);
  }

  function grantConsent(tool: Tool) {
    // The first connection is what ends onboarding: it is the moment readywhen
    // can see any work at all, so it is the moment the board and the 2nd Brain
    // stop being empty rooms. Read before the update, or every connection
    // announces the unlock again.
    const first = session.connected.length === 0;
    const decidedIn = connectSeenAt.current === null ? 0 : Date.now() - connectSeenAt.current;
    setPending(null);
    if (first) connectLeft.current = true;
    update({
      connected: [...session.connected, tool.slug],
      firstConnectedAt: first ? Date.now() : session.firstConnectedAt,
    });
    recordBusinessEvent("connector.connected", {
      slug: tool.slug,
      surface: "chat",
      is_first: first ? 1 : 0,
      connected_count: session.connected.length + 1,
      duration_bucket: durationBucket(decidedIn),
    });
    say({
      kind: "agent",
      text: `${tool.name} connected. Give me a second while I read the last 30 days…`,
    });
    setTimeout(() => {
      say(
        { kind: "agent", text: "Done. Here's what you said you'd do and haven't closed yet." },
        { kind: "commitments" },
      );
      if (first) {
        setTimeout(() => say({ kind: "agent", text: UNLOCK_MESSAGE }, { kind: "board" }), 900);
      }
    }, 1100);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    const wantsDraft = /draft|reply|invoice|tom/i.test(trimmed);
    recordBusinessEvent("chat.message_sent", { intent: wantsDraft ? "draft" : "other" });
    say({ kind: "user", text: trimmed });
    setTimeout(() => {
      if (wantsDraft) {
        say({ kind: "agent", text: "On it. Here's the draft, in your voice." }, { kind: "draft" });
        return;
      }
      say({ kind: "agent", text: CANNED_REPLIES[replyIndex % CANNED_REPLIES.length] });
      setReplyIndex((index) => index + 1);
    }, 650);
  }

  return (
    <AppShell>
      <div className="flex h-svh flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
          <Sparkles className="text-brand size-4" aria-hidden />
          <span className="text-sm font-medium">New thread</span>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-2xl flex-col gap-5 px-6 py-8">
            {messages.map((message, index) => (
              <div
                key={index}
                className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 duration-300"
              >
                {message.kind === "user" && (
                  <p className="bg-primary text-primary-foreground ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
                    {message.text}
                  </p>
                )}
                {message.kind === "agent" && (
                  <div className="flex gap-3">
                    <ReadywhenName className="text-muted-foreground mt-0.5 shrink-0 text-[11px]" />
                    <p className="max-w-[85%] text-sm leading-relaxed">{message.text}</p>
                  </div>
                )}
                {message.kind === "connect" && (
                  <ConnectCard
                    jtbd={session.jtbd}
                    onPick={(tool) => {
                      consentOpenedAt.current = Date.now();
                      connectLastAction.current = "picked";
                      recordBusinessEvent("connector.picked", { slug: tool.slug, surface: "chat" });
                      setPending(tool);
                    }}
                    connected={session.connected}
                  />
                )}
                {message.kind === "commitments" && <CommitmentsCard onAsk={send} />}
                {message.kind === "board" && (
                  <BoardCta
                    onOpen={() => {
                      recordBusinessEvent("inbox.opened_from_chat");
                      try {
                        window.sessionStorage.setItem("rwgc.inbox_via", "chat_cta");
                      } catch {}
                      router.push("/inbox");
                    }}
                  />
                )}
                {message.kind === "draft" && (
                  <DraftCard
                    sent={sent}
                    onSend={() => {
                      setSent(true);
                      recordBusinessEvent("draft.approved", { surface: "chat" });
                      say({
                        kind: "agent",
                        text: "Sent. I'll watch for Tom's reply and close the loop when it lands.",
                      });
                    }}
                  />
                )}
              </div>
            ))}
            <div ref={bottom} />
          </div>
        </div>

        <div className="shrink-0 border-t p-4">
          <form
            className="bg-card mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border p-2 shadow-xs"
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <Textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask anything, or tell me what you owe someone…"
              aria-label="Message"
              className="min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              variant="brand"
              size="icon"
              disabled={!input.trim()}
              aria-label="Send"
              className="shrink-0 rounded-xl"
            >
              <ArrowUp aria-hidden />
            </Button>
          </form>
        </div>
      </div>

      {pending && (
        <ConsentDialog
          tool={pending}
          onCancel={() => {
            const openFor = consentOpenedAt.current === null ? 0 : Date.now() - consentOpenedAt.current;
            connectLastAction.current = "consent_cancelled";
            recordBusinessEvent("connector.consent_cancelled", {
              slug: pending.slug,
              surface: "chat",
              duration_bucket: durationBucket(openFor),
            });
            setPending(null);
          }}
          onAllow={() => grantConsent(pending)}
        />
      )}
    </AppShell>
  );
}

const AGENT_INDENT = "ml-[4.6rem]";

function ConnectCard({
  onPick,
  connected,
  jtbd,
}: Readonly<{ onPick: (tool: Tool) => void; connected: string[]; jtbd: string | null }>) {
  const [showOthers, setShowOthers] = useState(false);
  const recommended = recommendedConnector(jtbd);
  const recommendedOn = connected.includes(recommended.slug);
  const ask = connectAsk(recommended, jtbd);
  const list =
    recommendedOn || showOthers
      ? CONNECTORS.filter((tool) => tool.slug !== recommended.slug)
      : [];

  return (
    <div
      className={cn(
        AGENT_INDENT,
        "bg-card flex max-w-md flex-col gap-3 rounded-xl border p-4 shadow-xs",
      )}
    >
      {!recommendedOn && (
        <>
          <p className="text-sm font-medium">{ask.title}</p>
          <p className="text-muted-foreground text-xs leading-relaxed">{ask.body}</p>
          <Button type="button" variant="brand" className="w-fit" onClick={() => onPick(recommended)}>
            <img src={recommended.iconSrc} alt="" className="size-4 object-contain" />
            {ask.button}
          </Button>
        </>
      )}

      {recommendedOn && (
        <p className="text-sm font-medium">Connect another tool</p>
      )}

      {list.length > 0 && (
        <ul className="flex flex-col gap-2">
          {list.map((tool) => {
            const on = connected.includes(tool.slug);
            return (
              <li key={tool.slug}>
                <button
                  type="button"
                  disabled={on}
                  onClick={() => onPick(tool)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                    on ? "border-brand bg-brand/5" : "border-input hover:bg-accent shadow-xs",
                  )}
                >
                  <img src={tool.iconSrc} alt="" className="size-5 shrink-0 object-contain" />
                  <span className="flex-1 text-sm font-medium">{tool.name}</span>
                  <span className={cn("text-xs", on ? "text-brand font-medium" : "text-muted-foreground")}>
                    {on ? "Connected" : "Connect"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!recommendedOn && !showOthers && (
        <button
          type="button"
          className="text-muted-foreground w-fit text-left text-xs underline underline-offset-2"
          onClick={() => {
            recordBusinessEvent("connector.others_opened", { recommended: recommended.slug });
            setShowOthers(true);
          }}
        >
          Use a different tool
        </button>
      )}
    </div>
  );
}

function BoardCta({ onOpen }: Readonly<{ onOpen: () => void }>) {
  return (
    <div className={AGENT_INDENT}>
      <Button type="button" variant="brand" onClick={onOpen} className="group">
        Open your board
        <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Button>
    </div>
  );
}

function CommitmentsCard({ onAsk }: Readonly<{ onAsk: (text: string) => void }>) {
  return (
    <div className={cn(AGENT_INDENT, "flex max-w-md flex-col gap-3")}>
      <ul className="bg-card divide-border divide-y overflow-hidden rounded-xl border shadow-xs">
        {FOUND_COMMITMENTS.map((item) => (
          <li key={item.title} className="flex flex-col gap-1.5 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="border-input size-4 shrink-0 rounded border-2" aria-hidden />
              <span className="flex-1 text-sm font-medium">{item.title}</span>
              <span className="text-muted-foreground text-xs">{item.due}</span>
            </div>
            <p className="text-muted-foreground pl-6 text-xs italic">{item.quote}</p>
            <p className="text-muted-foreground flex items-center gap-1.5 pl-6 font-mono text-[10px] tracking-wide uppercase">
              <img src={item.iconSrc} alt="" className="size-3 object-contain" />
              from {item.source}
            </p>
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" className="w-fit rounded-full" onClick={() => onAsk("Draft the reply to Tom with the June invoice")}>
        Draft the reply to Tom
      </Button>
    </div>
  );
}

function DraftCard({ sent, onSend }: Readonly<{ sent: boolean; onSend: () => void }>) {
  return (
    <div
      className={cn(
        AGENT_INDENT,
        "bg-card flex max-w-md flex-col gap-3 rounded-xl border p-4 shadow-xs",
      )}
    >
      <p className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs tracking-wide uppercase">
        <img src="/icons/gmail.svg" alt="" className="size-3.5" />
        Draft reply · to {DRAFT_REPLY.to}
      </p>
      <p className="text-sm font-semibold">{DRAFT_REPLY.subject}</p>
      <p className="text-sm leading-relaxed whitespace-pre-line">{DRAFT_REPLY.body}</p>
      {sent ? (
        <p className="text-brand flex items-center gap-2 font-mono text-xs tracking-wide uppercase">
          <Check className="size-3.5" aria-hidden /> Sent
        </p>
      ) : (
        <div className="flex gap-2">
          <Button variant="brand" size="sm" onClick={onSend}>
            <Check strokeWidth={3} aria-hidden /> Approve &amp; send
          </Button>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}

