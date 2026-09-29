"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock } from "lucide-react";

import { AppShell, Section } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Readywhen } from "@/components/ui/readywhen";
import {
  BRAIN_SUBTITLE,
  BRAIN_TITLE,
  CONNECT_MORE_HEADING,
  CONNECT_MORE_LINE,
  CONTEXT_HEADING,
  CONTEXT_HINT,
  CONNECTORS,
  COUNTDOWN_DESCRIPTION,
  COUNTDOWN_FOOTNOTE,
  countdownUnit,
  LEARNING_HEADING,
  LOCKED_SECTIONS,
  QUESTIONS,
  WORKING_DAYS_TO_UNLOCK,
} from "@/lib/content";
import { isUnlocked, useSession } from "@/lib/session";
import { cn } from "@/helpers/utils";

/**
 * The Brain *before* the reveal: the count is running, nothing has been learned
 * yet, and the only thing on the page the user can act on is telling it about
 * itself. The folders are deliberately absent — showing them here would give
 * away the payoff the five days exist for.
 *
 * Unreachable until a source is connected, so the count is always running by the
 * time anyone sees this: there is no "waiting to start" state to render.
 */
export default function BrainPage() {
  const router = useRouter();
  const { session, ready, update } = useSession();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!session.signedIn) router.replace("/signup");
    else if (!isUnlocked(session)) router.replace("/chat");
  }, [ready, session, router]);

  useEffect(() => {
    if (ready) setAnswers(session.context);
  }, [ready, session.context]);

  if (!ready || !session.signedIn || !isUnlocked(session)) return null;

  const dirty = QUESTIONS.some(({ key }) => (answers[key] ?? "") !== (session.context[key] ?? ""));

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-season text-3xl leading-tight font-semibold sm:text-4xl">
            {BRAIN_TITLE}
          </h1>
          <p className="text-muted-foreground max-w-prose text-base">
            <Readywhen />
            {BRAIN_SUBTITLE}
          </p>
        </header>

        <div className="mt-7">
          <Countdown />
        </div>

        <Section title={CONTEXT_HEADING}>
          <p className="text-muted-foreground -mt-1 mb-4 text-sm">{CONTEXT_HINT}</p>
          <div className="bg-card flex flex-col gap-5 rounded-xl border p-5 shadow-xs">
            {QUESTIONS.map((question) => (
              <label key={question.key} className="flex flex-col gap-2">
                <span className="text-sm font-medium">{question.label}</span>
                <Textarea
                  rows={2}
                  value={answers[question.key] ?? ""}
                  placeholder={question.placeholder}
                  aria-label={question.label}
                  onChange={(event) => {
                    setSaved(false);
                    setAnswers((prev) => ({ ...prev, [question.key]: event.target.value }));
                  }}
                />
              </label>
            ))}

            <div className="flex items-center justify-end gap-3">
              {saved && (
                <span className="text-brand flex items-center gap-1.5 text-xs font-medium">
                  <Check className="size-3.5" aria-hidden /> Saved
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={!dirty}
                onClick={() => {
                  update({ context: answers });
                  setSaved(true);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </Section>

        <Section title={LEARNING_HEADING}>
          <ul className="bg-card divide-border divide-y overflow-hidden rounded-xl border shadow-xs">
            {LOCKED_SECTIONS.map((locked) => (
              <li key={locked.key} className="flex items-center gap-3 px-4 py-3.5">
                <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-full">
                  <Lock className="size-3.5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium">{locked.name}</span>
                  <span className="text-muted-foreground text-xs">{locked.waiting}</span>
                </span>
                <span className="text-muted-foreground shrink-0 font-mono text-[10px] tracking-[0.07em] uppercase">
                  Ready in {WORKING_DAYS_TO_UNLOCK} {countdownUnit(WORKING_DAYS_TO_UNLOCK)}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={CONNECT_MORE_HEADING}>
          <p className="text-muted-foreground -mt-1 mb-4 text-sm">{CONNECT_MORE_LINE}</p>
          <ul className="flex flex-wrap gap-2">
            {CONNECTORS.map((tool) => {
              const on = session.connected.includes(tool.slug);
              return (
                <li key={tool.slug}>
                  <button
                    type="button"
                    disabled={on}
                    onClick={() => update({ connected: [...session.connected, tool.slug] })}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      on
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-input bg-card hover:bg-accent shadow-xs",
                    )}
                  >
                    <img src={tool.iconSrc} alt="" className="size-3.5 object-contain" />
                    {tool.name}
                    {on && <Check className="size-3" strokeWidth={3} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>

      </div>
    </AppShell>
  );
}

/**
 * The countdown to the reveal, built as an ink block carrying the promise, with
 * the numeral and the phrase it points at in mint. The one place this feature
 * spends contrast, so everything around it stays flat. `surface-inverse` stays
 * dark in both themes, so the mint holds either way.
 */
function Countdown() {
  return (
    <div className="bg-surface-inverse text-surface-inverse-foreground flex items-center gap-4 rounded-xl px-4 py-3">
      <span className="font-season text-surface-inverse-accent shrink-0 text-[2.6rem] leading-none font-semibold tabular-nums">
        {WORKING_DAYS_TO_UNLOCK}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] tracking-[0.07em] uppercase opacity-70">
          {countdownUnit(WORKING_DAYS_TO_UNLOCK)}
        </p>
        <p className="mt-0.5 text-sm">
          {COUNTDOWN_DESCRIPTION} <span className="opacity-70">{COUNTDOWN_FOOTNOTE}</span>
        </p>
      </div>
    </div>
  );
}
