/**
 * Records a product event.
 *
 * In production this forwards the event to Datadog, to product analytics and to
 * a structured log line, so a single call site reaches all three. In this
 * repository it writes to the console only.
 *
 * Conventions:
 *
 * - Event names use `<domain>.<action>` in the past tense, e.g.
 *   `signup.completed`, `connector.connected`.
 * - Tag values must be low-cardinality: enums or short slugs. Identifiers,
 *   email addresses and free text are not permitted, as each distinct value
 *   creates a separate billed series.
 * - The function never throws and returns void, so call sites need no error
 *   handling.
 */
export type BusinessEventTags = Record<string, string | number>;

export function recordBusinessEvent(name: string, tags?: BusinessEventTags): void {
  console.log(`[event] ${name}`, tags ?? {});
}
