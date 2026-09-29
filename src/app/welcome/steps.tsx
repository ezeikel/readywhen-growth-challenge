"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, Check, FileText } from "lucide-react";

import { cn } from "@/helpers/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurveySelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Readywhen } from "@/components/ui/readywhen";
import { EXPLAINER_SCREENS, JTBD_OPTIONS, SURVEY_FIELDS, WORK_TOOLS } from "@/lib/content";

function StepHeader({ title, sub }: Readonly<{ title: string; sub?: ReactNode }>) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="font-season text-foreground text-3xl leading-tight font-semibold sm:text-4xl">
        {title}
      </h1>
      {sub && <p className="text-muted-foreground max-w-prose text-base">{sub}</p>}
    </header>
  );
}

function Footer({ children, onBack }: Readonly<{ children: ReactNode; onBack?: () => void }>) {
  return (
    <div className={cn("flex items-center", onBack ? "justify-between" : "justify-end")}>
      {onBack && (
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
      )}
      {children}
    </div>
  );
}

/** "acme.com" → "Acme". A consumer domain gets nothing to suggest. */
function suggestOrgName(domain: string | null): string {
  const consumer = ["gmail.com", "outlook.com", "hotmail.com", "icloud.com", "yahoo.com"];
  if (!domain || consumer.includes(domain)) return "";
  const stem = domain.split(".")[0];
  return stem.charAt(0).toUpperCase() + stem.slice(1);
}

/** Step 1 — name the organisation, seeded from the email domain. */
export function OrgNameStep({
  domain,
  onContinue,
}: Readonly<{ domain: string | null; onContinue: (name: string) => void }>) {
  const [name, setName] = useState(() => suggestOrgName(domain));

  return (
    <form
      className="flex w-full flex-col"
      style={{ gap: "2.5rem" }}
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim()) onContinue(name.trim());
      }}
    >
      <StepHeader title="Name your organisation." sub="You can rename it anytime." />
      <label className="flex flex-col gap-2">
        <span className="text-foreground text-sm font-medium">Organisation name</span>
        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          placeholder="e.g. Acme Inc"
          aria-label="Organisation name"
        />
      </label>
      <Footer>
        <Button type="submit" disabled={!name.trim()} className="group">
          Continue
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Button>
      </Footer>
    </form>
  );
}

/** Step 2 — your name, then the sign-up survey. */
export function ProfileStep({
  onContinue,
}: Readonly<{
  onContinue: (values: {
    firstName: string;
    lastName: string;
    survey: Record<string, string>;
  }) => void;
}>) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [survey, setSurvey] = useState<Record<string, string>>({});

  const complete =
    firstName.trim() !== "" && SURVEY_FIELDS.every((field) => (survey[field.key] ?? "") !== "");

  return (
    <form
      className="flex w-full flex-col"
      style={{ gap: "2.5rem" }}
      onSubmit={(event) => {
        event.preventDefault();
        if (complete) {
          onContinue({ firstName: firstName.trim(), lastName: lastName.trim(), survey });
        }
      }}
    >
      <StepHeader
        title={firstName ? `Hi ${firstName}.` : "Welcome."}
        sub={
          <>
            A couple of quick things, then <Readywhen /> gets to work.
          </>
        }
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-foreground mb-1.5 text-sm font-medium">Your name</legend>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="First name"
            aria-label="First name"
            autoComplete="given-name"
          />
          <Input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Last name"
            aria-label="Last name"
            autoComplete="family-name"
          />
        </div>
      </fieldset>

      <fieldset
        className="grid sm:grid-cols-2"
        style={{ columnGap: "1.5rem", rowGap: "2.25rem" }}
      >
        {SURVEY_FIELDS.map((field) => (
          <SurveySelect
            key={field.key}
            label={field.label}
            options={field.options}
            value={survey[field.key] ?? ""}
            onChange={(value) => setSurvey((prev) => ({ ...prev, [field.key]: value }))}
          />
        ))}
      </fieldset>

      <Footer>
        <Button type="submit" disabled={!complete} className="group">
          Continue
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Button>
      </Footer>
    </form>
  );
}

/** Step 3 — scan, capture, close. A step indicator, not a carousel. */
export function ExplainerStep({ onContinue }: Readonly<{ onContinue: () => void }>) {
  const [index, setIndex] = useState(0);
  const screen = EXPLAINER_SCREENS[index];
  const isLast = index === EXPLAINER_SCREENS.length - 1;

  return (
    <div className="flex w-full flex-col gap-7">
      <section
        key={screen.id}
        aria-label={`Step ${index + 1} of ${EXPLAINER_SCREENS.length}`}
        className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 flex flex-col gap-7 duration-300"
      >
        <StepHeader title={screen.headline} sub={screen.sub} />
        <div className="bg-muted/40 flex min-h-72 flex-col justify-center rounded-2xl border p-4 sm:p-5">
          {screen.id === "scan" && <ScanArt />}
          {screen.id === "capture" && <CaptureArt />}
          {screen.id === "close" && <CloseArt />}
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <ol className="flex items-center">
          {EXPLAINER_SCREENS.map((item, i) => (
            <li key={item.id} className="flex">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "step" : undefined}
                aria-label={`Step ${i + 1} of ${EXPLAINER_SCREENS.length}: ${item.headline}`}
                className="focus-visible:ring-ring flex items-center rounded-full px-1 py-2 focus:outline-none focus-visible:ring-2"
              >
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "bg-brand w-5" : "bg-border w-1.5",
                  )}
                />
              </button>
            </li>
          ))}
        </ol>

        <Button
          type="button"
          variant="brand"
          onClick={() => (isLast ? onContinue() : setIndex(index + 1))}
          className="group"
        >
          {screen.cta}
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function MicroLabel({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs tracking-wide uppercase">
      {children}
    </span>
  );
}

function ScanArt() {
  return (
    <div className="flex flex-col items-center gap-1">
      <ul className="grid w-full max-w-xs grid-cols-3 gap-2">
        {WORK_TOOLS.slice(0, 6).map((tool) => (
          <li
            key={tool.slug}
            className="bg-card border-border flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 shadow-xs"
          >
            <img src={tool.iconSrc} alt="" className="size-4 shrink-0 object-contain" />
            <span className="truncate text-xs font-medium">{tool.name}</span>
          </li>
        ))}
      </ul>

      <svg viewBox="0 0 240 44" fill="none" className="text-border h-11 w-full max-w-xs" aria-hidden>
        <path d="M20 0 C20 26 120 16 120 38" stroke="currentColor" strokeWidth="1" />
        <path d="M120 0 V38" stroke="currentColor" strokeWidth="1" />
        <path d="M220 0 C220 26 120 16 120 38" stroke="currentColor" strokeWidth="1" />
        <circle cx="120" cy="39" r="3" className="text-brand" fill="currentColor" />
      </svg>

      <span className="border-brand bg-card flex items-center gap-2 rounded-xl border px-3.5 py-2 shadow-xs">
        <span className="bg-brand flex size-5 items-center justify-center rounded-md">
          <Check className="text-brand-foreground size-3" strokeWidth={3} aria-hidden />
        </span>
        <Readywhen className="text-foreground text-sm" />
      </span>

      <MicroLabel>
        <span className="bg-brand size-1.5 rounded-full" aria-hidden />
        <span>Scanning across your tools</span>
      </MicroLabel>
    </div>
  );
}

function CaptureArt() {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-muted flex flex-col gap-2 rounded-xl p-4">
        <MicroLabel>
          <img src="/icons/gmail.svg" alt="" className="size-3.5" />
          Tom Blake · Email
        </MicroLabel>
        <p className="text-sm leading-relaxed">
          &ldquo;Thanks for the great work last month. When you get a sec, could you{" "}
          <strong className="font-semibold">send over the invoice for June</strong>? Want to get it
          paid this week.&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" aria-hidden />
        <MicroLabel>Caught</MicroLabel>
        <span className="bg-border h-px flex-1" aria-hidden />
      </div>

      <div className="bg-card flex items-start gap-3 rounded-xl border p-4 shadow-xs">
        <span className="border-input mt-0.5 size-4 shrink-0 rounded border-2" aria-hidden />
        <span className="flex min-w-0 flex-col gap-2">
          <span className="text-sm font-semibold">Send Tom the invoice for June</span>
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="bg-warning/10 inline-flex items-center gap-1.5 rounded-md px-2 py-1">
              <span className="bg-warning size-1.5 rounded-full" aria-hidden />
              <span className="text-xs font-medium">due Fri</span>
            </span>
            <span className="bg-muted inline-flex items-center gap-1.5 rounded-md px-2 py-1">
              <img src="/icons/gmail.svg" alt="" className="size-3" />
              <span className="text-xs font-medium">from email</span>
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}

function CloseArt() {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs">
        <MicroLabel>
          <img src="/icons/gmail.svg" alt="" className="size-3.5" />
          Draft reply · to Tom
        </MicroLabel>
        <p className="text-sm leading-relaxed">
          Hi Tom. Thanks, glad it went well. June invoice attached, due in 14 days. Shout if
          anything is unclear.
          <br />
          Best,
        </p>
        <div className="border-border bg-background relative flex items-center gap-2 overflow-hidden rounded-lg border py-1.5 pr-2 pl-4">
          <span
            className="bg-muted-foreground absolute top-0 bottom-0 left-0 w-1 rounded-l-lg"
            aria-hidden
          />
          <FileText className="text-muted-foreground size-4 shrink-0" aria-hidden />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium">June invoice.pdf</span>
            <span className="text-muted-foreground text-[11px]">PDF attachment</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5" aria-hidden>
          <span className="bg-brand text-brand-foreground inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium">
            <Check className="size-3" strokeWidth={3} />
            Approve &amp; send
          </span>
          <span className="border-input inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium">
            Edit
          </span>
        </div>
      </div>

      <div className="border-brand/20 bg-brand/5 flex items-center gap-3 rounded-xl border p-4">
        <span className="bg-brand flex size-5 shrink-0 items-center justify-center rounded-full">
          <Check className="text-brand-foreground size-3" strokeWidth={3} aria-hidden />
        </span>
        <span className="text-muted-foreground min-w-0 flex-1 truncate text-sm line-through">
          Send Tom the invoice for June
        </span>
        <span className="text-brand font-mono text-xs tracking-wide uppercase">Done</span>
      </div>
    </div>
  );
}

/** Step 4 — where does your work happen. Selection only, nothing connects here. */
export function ToolsStep({
  selected,
  onToggle,
  other,
  onOtherChange,
  onContinue,
  onBack,
}: Readonly<{
  selected: string[];
  onToggle: (slug: string) => void;
  other: string;
  onOtherChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}>) {
  return (
    <div className="flex w-full flex-col gap-8">
      <StepHeader
        title="Where does your work happen?"
        sub={
          <>
            <Readywhen />
            keeps an eye on the places you already work and catches what you said you&apos;d do, so
            nothing slips through the cracks. Pick the tools you use.
          </>
        }
      />

      <ul className="grid grid-cols-3 gap-3">
        {WORK_TOOLS.map((tool) => {
          const on = selected.includes(tool.slug);
          return (
            <li key={tool.slug}>
              <button
                type="button"
                aria-pressed={on}
                aria-label={`${tool.name}${on ? " — selected" : ""}`}
                onClick={() => onToggle(tool.slug)}
                className={cn(
                  "focus-visible:ring-ring relative flex w-full items-center justify-between gap-2.5 rounded-xl border px-3.5 py-3 text-left transition focus:outline-none focus-visible:ring-2",
                  on
                    ? "border-brand bg-brand/5"
                    : "border-input bg-card shadow-xs hover:-translate-y-0.5 hover:shadow-sm",
                )}
              >
                <img src={tool.iconSrc} alt="" className="size-6 shrink-0 object-contain" />
                {/* Hidden on phones: at 3 columns the label truncates to one
                    meaningless glyph. The icon carries recognition; the name
                    stays in the button's aria-label. */}
                <span className="hidden min-w-0 flex-1 truncate text-sm font-medium sm:block">
                  {tool.name}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full transition",
                    on ? "bg-brand" : "border-input border",
                  )}
                >
                  {on && <Check className="text-brand-foreground size-3" strokeWidth={3} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <label className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-medium">Use something else?</span>
        <Input
          value={other}
          onChange={(event) => onOtherChange(event.target.value)}
          placeholder="Add a tool, e.g. Linear, Intercom, Zoom"
          aria-label="Other tools you use"
        />
      </label>

      <Footer onBack={onBack}>
        <Button type="button" onClick={onContinue} className="group">
          Continue
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Button>
      </Footer>
    </div>
  );
}

/** Step 5 — the job to be done. This is what the agent opens the chat with. */
export function SlipsStep({
  selected,
  onSelect,
  detail,
  onDetailChange,
  onContinue,
  onBack,
}: Readonly<{
  selected: string | null;
  onSelect: (slug: string) => void;
  detail: string;
  onDetailChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}>) {
  return (
    <div className="flex w-full flex-col gap-8">
      <StepHeader
        title="What is slowing you down right now?"
        sub={
          <>
            Choose one, and <Readywhen /> will get it done for you.
          </>
        }
      />

      <ul
        className="flex flex-col gap-3"
        role="radiogroup"
        aria-label="What is slowing you down right now"
      >
        {JTBD_OPTIONS.map((option) => {
          const on = selected === option.slug;
          return (
            <li key={option.slug}>
              <button
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onSelect(option.slug)}
                className={cn(
                  "focus-visible:ring-ring flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition focus:outline-none focus-visible:ring-2",
                  on
                    ? "border-brand bg-brand/5"
                    : "border-input bg-card shadow-xs hover:-translate-y-0.5 hover:shadow-sm",
                )}
              >
                <span className="min-w-0 flex-1 text-sm font-medium">{option.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full transition",
                    on ? "bg-brand" : "border-input border",
                  )}
                >
                  {on && <Check className="text-brand-foreground size-3" strokeWidth={3} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <label className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-medium">
          Anything specific? (optional)
        </span>
        <Textarea
          rows={2}
          value={detail}
          onChange={(event) => onDetailChange(event.target.value)}
          placeholder="e.g. I keep forgetting to follow up after prospect calls"
          aria-label="Anything specific that keeps slipping"
        />
      </label>

      <Footer onBack={onBack}>
        <Button type="button" onClick={onContinue} disabled={!selected} className="group">
          Continue
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Button>
      </Footer>
    </div>
  );
}
