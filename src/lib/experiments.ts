"use client";

import { useEffect, useState } from "react";

import { recordOnce } from "@/lib/funnel-events";

/**
 * A/B testing, cut down to what a demo can honestly do.
 *
 * There is no traffic splitting here. Nobody is going to run this repo at a
 * scale where splitting means anything, and a reviewer who got randomly bucketed
 * would only ever see one arm. So: the URL picks the arm, and the choice is
 * stored for the tab so it survives the next route. `?first-session=control`
 * forces the control even if the tab had already seen the variant.
 *
 * `traffic` is the share of sign-ups I would put on the variant. It is a
 * decision recorded here, not something this file enforces. 0.5 is a 50/50
 * split, with no holdout.
 */
export interface Experiment {
  /** Stable name, and the query parameter that switches arms locally. */
  key: string;
  /** Arm names. The first one is the control. */
  variants: readonly string[];
  /** Share of sign-ups on the variant, 0 to 1. */
  traffic: number;
}

/**
 * Control is the funnel after the Task 2 changes.
 * `promise-first` skips the interview. They name one promise, see it on the
 * board with a draft, then we ask for Gmail.
 */
export const FIRST_SESSION: Experiment = {
  key: "first-session",
  variants: ["control", "promise-first"],
  traffic: 0.5,
};

/** Register your experiments here. */
export const EXPERIMENTS: readonly Experiment[] = [FIRST_SESSION];

const storageKey = (key: string) => `rwgc.experiment.${key}`;

export const resetExperimentMemory = (): void => {
  try {
    const keys: string[] = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith("rwgc.experiment.")) keys.push(key);
    }
    for (const key of keys) window.sessionStorage.removeItem(key);
  } catch {
    // private mode, or storage already gone
  }
};

/**
 * The arm to render, plus `ready` once the URL and the tab have been read.
 * The first paint is the control. Callers that route on the arm should wait
 * for `ready`, or a fast click lands on the wrong funnel.
 */
export const useExperiment = (
  experiment: Experiment,
): { variant: string; ready: boolean } => {
  const [variant, setVariant] = useState(experiment.variants[0]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get(experiment.key);
    let chosen: string = experiment.variants[0];

    if (asked && experiment.variants.includes(asked)) {
      chosen = asked;
      try {
        window.sessionStorage.setItem(storageKey(experiment.key), asked);
      } catch {
        // the arm still applies on this page
      }
    } else {
      try {
        const stored = window.sessionStorage.getItem(storageKey(experiment.key));
        if (stored && experiment.variants.includes(stored)) chosen = stored;
      } catch {
        // stay on the control
      }
    }

    setVariant(chosen);
    setReady(true);
    recordOnce(`experiment.exposed.${experiment.key}.${chosen}`, "experiment.exposed", {
      experiment: experiment.key,
      variant: chosen,
    });
  }, [experiment]);

  return { variant, ready };
};
