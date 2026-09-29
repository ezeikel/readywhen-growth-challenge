import { cn } from "@/helpers/utils";

/**
 * Brand wordmark for inline prose — "readywhen" mimicking the logo: `ready`
 * semibold + `when` italic, never broken across lines, one accessible name so
 * assistive tech reads it as one word.
 */
export function ReadywhenName({ className }: Readonly<{ className?: string }>) {
  return (
    <span
      aria-label="readywhen"
      translate="no"
      className={cn("notranslate whitespace-nowrap", className)}
    >
      <span className="font-semibold">ready</span>
      {/* Pull "when" left to absorb the italic's side-bearing. */}
      <span className="-ml-[0.08em] italic">when</span>
    </span>
  );
}

export function Readywhen({ className }: Readonly<{ className?: string }>) {
  return (
    <>
      <ReadywhenName className={className} />
      {/* JSX strips whitespace spanning a newline, so the space is emitted here. */}{" "}
    </>
  );
}
