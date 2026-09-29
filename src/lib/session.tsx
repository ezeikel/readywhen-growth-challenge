"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * The entire "backend". Everything the funnel collects lives here and is mirrored
 * into localStorage, so a reload resumes at the right step and nothing needs a
 * server. Reset from the sidebar (or clear the key) to run the funnel again.
 */
export interface Session {
  signedIn: boolean;
  email: string | null;
  provider: string | null;
  orgName: string | null;
  firstName: string;
  lastName: string;
  survey: Record<string, string>;
  tools: string[];
  jtbd: string | null;
  jtbdDetail: string;
  connected: string[];
  /** The three things the user tells the Brain themselves. */
  context: Record<string, string>;
  brainSeen: boolean;
}

export const EMPTY_SESSION: Session = {
  signedIn: false,
  email: null,
  provider: null,
  orgName: null,
  firstName: "",
  lastName: "",
  survey: {},
  tools: [],
  jtbd: null,
  jtbdDetail: "",
  connected: [],
  context: {},
  brainSeen: false,
};

const KEY = "rwgc.session";

/**
 * Chat is the only surface a new user gets. The board and the 2nd Brain have
 * nothing in them until readywhen can see the user's work, so they stay locked
 * until the first source is connected — which happens in chat, at the end of
 * onboarding. Showing an empty board to someone who has connected nothing is the
 * fastest way to make the product look like it does nothing.
 */
export function isUnlocked(session: Session): boolean {
  return session.connected.length > 0;
}

interface Store {
  session: Session;
  ready: boolean;
  update: (patch: Partial<Session>) => void;
  reset: () => void;
}

const SessionContext = createContext<Store | null>(null);

export function SessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [session, setSession] = useState<Session>(EMPTY_SESSION);
  // `ready` gates the first paint on the client read: rendering the stored
  // session during SSR is impossible, and rendering the empty one would bounce a
  // signed-in visitor back to /signup for a frame.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setSession({ ...EMPTY_SESSION, ...JSON.parse(raw) });
    } catch {
      // corrupt or unavailable storage — start clean rather than crash
    }
    setReady(true);
  }, []);

  const update = useCallback((patch: Partial<Session>) => {
    setSession((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ponytail: a private-mode visitor just loses resume-on-reload
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // nothing to clear
    }
    setSession(EMPTY_SESSION);
  }, []);

  const value = useMemo(() => ({ session, ready, update, reset }), [session, ready, update, reset]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Store {
  const store = useContext(SessionContext);
  if (!store) throw new Error("useSession must be used inside <SessionProvider>");
  return store;
}
