"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Check, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReadywhenName } from "@/components/ui/readywhen";
import { cn } from "@/helpers/utils";
import {
  CANNED_REPLIES,
  CONNECTORS,
  DRAFT_REPLY,
  FOUND_COMMITMENTS,
  openingLine,
  type Tool,
} from "@/lib/content";
import { useSession } from "@/lib/session";

/** Said once, the first time a source is connected. */
const UNLOCK_MESSAGE =
  "Your board and your 2nd Brain are open now — both are in the sidebar. The board is everything I'm tracking; the Brain is what I'm working out about your business.";

type Message =
  | { kind: "agent" | "user"; text: string }
  | { kind: "connect" }
  | { kind: "commitments" }
  | { kind: "draft" };

export default function ChatPage() {
  const router = useRouter();
  const { session, ready, update } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<Tool | null>(null);
  const [sent, setSent] = useState(false);
  const [replyIndex, setReplyIndex] = useState(0);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready && !session.signedIn) router.replace("/signup");
  }, [ready, session.signedIn, router]);

  // The agent opens the conversation, then offers the connect card a beat later.
  // Deliberately idempotent rather than ref-guarded: React's dev StrictMode runs
  // the effect, tears it down, and runs it again, and a guarded version had its
  // timer cleared by that teardown — the connect card never appeared in dev.
  useEffect(() => {
    if (!ready || !session.signedIn) return;
    setMessages([{ kind: "agent", text: openingLine(session.jtbd, session.firstName) }]);
    const timer = setTimeout(() => setMessages((prev) => [...prev, { kind: "connect" }]), 700);
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
    setPending(null);
    update({ connected: [...session.connected, tool.slug] });
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
        setTimeout(() => say({ kind: "agent", text: UNLOCK_MESSAGE }), 900);
      }
    }, 1100);
  }

  function send(text: string) {
    if (!text.trim()) return;
    setInput("");
    say({ kind: "user", text: text.trim() });
    const wantsDraft = /draft|reply|invoice|tom/i.test(text);
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
                  <ConnectCard onPick={setPending} connected={session.connected} />
                )}
                {message.kind === "commitments" && <CommitmentsCard onAsk={send} />}
                {message.kind === "draft" && (
                  <DraftCard
                    sent={sent}
                    onSend={() => {
                      setSent(true);
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
          onCancel={() => setPending(null)}
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
}: Readonly<{ onPick: (tool: Tool) => void; connected: string[] }>) {
  return (
    <div
      className={cn(
        AGENT_INDENT,
        "bg-card flex max-w-md flex-col gap-3 rounded-xl border p-4 shadow-xs",
      )}
    >
      <p className="text-sm font-medium">Connect where your work happens</p>
      <p className="text-muted-foreground text-xs">
        I only read what I need to find your commitments.
      </p>
      <ul className="flex flex-col gap-2">
        {CONNECTORS.map((tool) => {
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

/** The provider's consent screen, faked. Nothing leaves the browser. */
function ConsentDialog({
  tool,
  onAllow,
  onCancel,
}: Readonly<{ tool: Tool; onAllow: () => void; onCancel: () => void }>) {
  const scopes = [
    `Read your ${tool.name} messages and metadata`,
    "Create drafts on your behalf",
    "See who you exchange messages with",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backdropFilter: "blur(4px)",
        backgroundColor: "color-mix(in oklab, var(--foreground) 36%, transparent)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Connect ${tool.name}`}
    >
      <div className="bg-background motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 flex w-full max-w-sm flex-col gap-5 rounded-2xl border p-6 shadow-2xl duration-200">
        <div className="flex items-center gap-3">
          <img src={tool.iconSrc} alt="" className="size-8 object-contain" />
          <div>
            <p className="text-sm font-semibold">Connect {tool.name}</p>
            <p className="text-muted-foreground text-xs">
              <ReadywhenName /> wants access to your {tool.name} account
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-2">
          {scopes.map((scope) => (
            <li key={scope} className="flex items-start gap-2 text-xs">
              <Check className="text-brand mt-0.5 size-3.5 shrink-0" aria-hidden />
              {scope}
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-[11px]">
          This is a mock. No account is contacted and nothing leaves your browser.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="brand" onClick={onAllow}>
            Allow
          </Button>
        </div>
      </div>
    </div>
  );
}
