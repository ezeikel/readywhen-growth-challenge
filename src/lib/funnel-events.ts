"use client";

import { useCallback, useEffect, useRef } from "react";

import { recordBusinessEvent, type BusinessEventTags } from "./metrics";

/**
 * Events for the sign-up funnel. recordBusinessEvent is the sink; this file
 * only decides names, tags and clocks.
 *
 * Duration is a bucket, not a raw millisecond count. The sink bills one series
 * per distinct tag value, so a timestamp would be a series per visitor. The
 * buckets are the decision we actually want:
 *
 *   lt_5s     left before they could have read the step
 *   5s_15s    skimmed and decided
 *   15s_45s   read it
 *   45s_2m    hesitated
 *   2m_5m     stuck, or got distracted
 *   gt_5m     the tab stayed open
 *
 * Leaving is pagehide (tab close, refresh, a real navigation away). Continue
 * and Back record their own events, so unmounting a welcome step is not an
 * abandon. React StrictMode runs effects twice; the viewed ref blocks the
 * second view on the same mount.
 */

export type DurationBucket = "lt_5s" | "5s_15s" | "15s_45s" | "45s_2m" | "2m_5m" | "gt_5m";

const seen = new Set<string>();

export const durationBucket = (ms: number): DurationBucket => {
  const seconds = ms / 1000;
  if (seconds < 5) return "lt_5s";
  if (seconds < 15) return "5s_15s";
  if (seconds < 45) return "15s_45s";
  if (seconds < 120) return "45s_2m";
  if (seconds < 300) return "2m_5m";
  return "gt_5m";
};

/** Once per tab. Start over clears the set so a second demo run still emits. */
export const recordOnce = (key: string, name: string, tags?: BusinessEventTags): void => {
  if (seen.has(key)) return;
  seen.add(key);
  recordBusinessEvent(name, tags);
};

export const resetFunnelMemory = (): void => {
  seen.clear();
};

export const sinceConnectBucket = (connectedAt: number | null): DurationBucket | "unknown" => {
  if (connectedAt === null) return "unknown";
  return durationBucket(Date.now() - connectedAt);
};

/**
 * Clock for one welcome step. `mark` is the last thing they did, so a leave
 * event can say where inside the step they were. `complete` is Continue.
 */
export const useStepTiming = (step: string) => {
  const started = useRef(Date.now());
  const lastAction = useRef("none");
  const finished = useRef(false);
  const viewed = useRef(false);

  useEffect(() => {
    if (!viewed.current) {
      viewed.current = true;
      started.current = Date.now();
      recordBusinessEvent("welcome.step_viewed", { step });
    }

    const onPageHide = () => {
      if (finished.current) return;
      finished.current = true;
      recordBusinessEvent("welcome.step_left", {
        step,
        duration_bucket: durationBucket(Date.now() - started.current),
        last_action: lastAction.current,
      });
    };

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [step]);

  const mark = useCallback((action: string) => {
    lastAction.current = action;
  }, []);

  const complete = useCallback(
    (tags?: BusinessEventTags) => {
      if (finished.current) return;
      finished.current = true;
      recordBusinessEvent("welcome.step_completed", {
        step,
        duration_bucket: durationBucket(Date.now() - started.current),
        ...tags,
      });
    },
    [step],
  );

  return { mark, complete };
};
