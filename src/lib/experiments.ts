"use client";

import { useEffect, useState } from "react";

import { recordOnce } from "@/lib/funnel-events";

/**
 * A/B testing, cut down to what a demo can honestly do.
 *
 * There is no traffic splitting here. Nobody is going to run this repo at a
 * scale where splitting means anything, and a reviewer who got randomly bucketed
 * would only ever see one arm. So the URL picks the arm, and the choice is
 * kept for the tab so it survives the next route.
 *
 * `traffic` is the share of sign-ups I would put on the variant. It is a
 * decision recorded here, not something this file enforces.
 */
export interface Experiment {
  /** Stable name, and the query parameter that switches arms locally. */
  key: string;
  /** Arm names. The first one is the control. */
  variants: readonly string[];
  /** Share of sign-ups on the variant, 0 to 1. */
  traffic: number;
}

export const FIRST_SESSION: Experiment = {
  key: "first-session",
  variants: ["control", "promise-first"],
  traffic: 0.5,
};

/** Register your experiments here. */
export const EXPERIMENTS: readonly Experiment[] = [FIRST_SESSION];

const STORAGE_PREFIX = "rwgc.experiment.";

export const resetExperimentMemory = (): void => {
  try {
    const keys: string[] = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    for (const key of keys) window.sessionStorage.removeItem(key);
  } catch {}
};

// The first paint is the control. Anything that routes on the arm must wait for `ready`.
export const useExperiment = (
  experiment: Experiment,
): { variant: string; ready: boolean } => {
  const [variant, setVariant] = useState(experiment.variants[0]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storageKey = STORAGE_PREFIX + experiment.key;
    const isArm = (value: string | null): value is string =>
      value !== null && experiment.variants.includes(value);
    const asked = new URLSearchParams(window.location.search).get(experiment.key);
    let chosen = isArm(asked) ? asked : experiment.variants[0];

    try {
      if (isArm(asked)) window.sessionStorage.setItem(storageKey, asked);
      else {
        const stored = window.sessionStorage.getItem(storageKey);
        if (isArm(stored)) chosen = stored;
      }
    } catch {}

    setVariant(chosen);
    setReady(true);
    recordOnce(`experiment.exposed.${experiment.key}.${chosen}`, "experiment.exposed", {
      experiment: experiment.key,
      variant: chosen,
    });
  }, [experiment]);

  return { variant, ready };
};
