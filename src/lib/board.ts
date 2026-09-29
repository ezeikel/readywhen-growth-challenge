const TIMEOUT_MS = 8000;

type BoardLoadFailure = "timeout" | "error";

// Mocked request. Add ?board=fail or ?board=slow to /inbox to see the failure path.
export const loadBoard = (): Promise<void> => {
  const mode = new URLSearchParams(window.location.search).get("board");
  let requestTimer: ReturnType<typeof setTimeout> | undefined;
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

  const request = new Promise<void>((resolve, reject) => {
    if (mode === "slow") return;
    requestTimer = setTimeout(() => (mode === "fail" ? reject(new Error("error")) : resolve()), 400);
  });
  const timeout = new Promise<never>((_, reject) => {
    timeoutTimer = setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS);
  });

  return Promise.race([request, timeout]).finally(() => {
    clearTimeout(requestTimer);
    clearTimeout(timeoutTimer);
  });
};

export const failureReason = (error: unknown): BoardLoadFailure =>
  error instanceof Error && error.message === "timeout" ? "timeout" : "error";
