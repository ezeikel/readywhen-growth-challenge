"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SOCIAL_PROVIDERS } from "@/lib/content";
import { FIRST_SESSION, useExperiment } from "@/lib/experiments";
import { durationBucket, recordOnce } from "@/lib/funnel-events";
import { recordBusinessEvent } from "@/lib/metrics";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEMO_EMAIL = "you@acme.com";

/**
 * One form behind two doors, same as the product: /signup and /login render
 * identically and both accept anyone. The route only exists so the funnel can
 * tell which one the visitor meant, which is unknowable on a shared URL.
 */
export function AuthScreen({ intent }: Readonly<{ intent: "login" | "signup" }>) {
  const router = useRouter();
  const { update } = useSession();
  const [email, setEmail] = useState("");
  const { variant, ready: armReady } = useExperiment(FIRST_SESSION);
  const started = useRef(Date.now());
  const finished = useRef(false);
  const lastAction = useRef("none");
  const viewed = useRef(false);

  useEffect(() => {
    if (!viewed.current) {
      viewed.current = true;
      started.current = Date.now();
      recordBusinessEvent("signup.viewed", { intent });
    }

    const onPageHide = () => {
      if (finished.current) return;
      finished.current = true;
      recordBusinessEvent("signup.left", {
        intent,
        duration_bucket: durationBucket(Date.now() - started.current),
        last_action: lastAction.current,
      });
    };

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [intent]);

  function signIn(provider: string, address: string) {
    if (!finished.current) {
      finished.current = true;
      recordBusinessEvent("signup.completed", {
        intent,
        provider,
        duration_bucket: durationBucket(Date.now() - started.current),
      });
    }
    update({ signedIn: true, provider, email: address });
    router.push(variant === "promise-first" ? "/start" : "/welcome");
  }

  const other = intent === "signup" ? "login" : "signup";

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-8 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Image
          src="/logos/readywhen-lockup-on-light.webp"
          alt="readywhen"
          translate="no"
          width={188}
          height={32}
          style={{ height: "auto" }}
          priority
          className="notranslate self-center"
        />

        <div className="bg-card flex flex-col gap-4 rounded-xl border p-6 shadow-xs">
          <h1 className="text-center text-base font-semibold">
            {intent === "login" ? "Welcome back" : "Create your account"}
          </h1>

          {SOCIAL_PROVIDERS.map((provider) => (
            <Button
              key={provider.id}
              variant="outline"
              size="lg"
              onClick={() => {
                lastAction.current = "provider_clicked";
                signIn(provider.id, DEMO_EMAIL);
              }}
              disabled={!armReady}
              className="w-full justify-start"
            >
              <img src={provider.iconSrc} alt="" className="size-4 object-contain" />
              {provider.label}
            </Button>
          ))}

          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="bg-border h-px flex-1" aria-hidden />
            or
            <span className="bg-border h-px flex-1" aria-hidden />
          </div>

          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              signIn("email", email.trim() || DEMO_EMAIL);
            }}
          >
            <Input
              type="email"
              value={email}
              onChange={(event) => {
                const next = event.target.value;
                if (email === "" && next !== "") {
                  lastAction.current = "email_typed";
                  recordOnce(`signup.email_started.${intent}`, "signup.email_started", { intent });
                }
                setEmail(next);
              }}
              placeholder="you@company.com"
              aria-label="Work email"
            />
            <Button type="submit" size="lg" className="w-full" disabled={!armReady}>
              Continue with email
            </Button>
          </form>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          {intent === "signup" ? "Already have an account? " : "New here? "}
          <Link
            href={`/${other}`}
            className="underline underline-offset-2"
            onClick={() =>
              recordBusinessEvent("signup.door_switched", { from: intent, to: other })
            }
          >
            {other === "login" ? "Sign in" : "Create one"}
          </Link>
        </p>
      </div>
    </div>
  );
}
