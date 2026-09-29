"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { AppShell, OnboardingCard } from "@/components/AppShell";
import { FIRST_SESSION, useExperiment } from "@/lib/experiments";
import { useSession } from "@/lib/session";
import { ExplainerStep, OrgNameStep, ProfileStep, SlipsStep, ToolsStep } from "./steps";

const STEPS = ["org", "profile", "explainer", "tools", "slips"] as const;
type Step = (typeof STEPS)[number];

/**
 * The whole pre-board flow, as the product runs it: one surface, one frosted card
 * over the live board, five steps that never change the backdrop.
 */
export default function WelcomePage() {
  const router = useRouter();
  const { session, ready, update } = useSession();
  const { variant, ready: armReady } = useExperiment(FIRST_SESSION);
  const [step, setStep] = useState<Step>("org");
  const [other, setOther] = useState("");

  useEffect(() => {
    if (!ready || !armReady) return;
    if (!session.signedIn) router.replace("/signup");
    else if (variant === "promise-first") router.replace("/start");
  }, [ready, armReady, session.signedIn, variant, router]);

  if (!ready || !armReady || !session.signedIn || variant === "promise-first") return null;

  const next = () => setStep(STEPS[STEPS.indexOf(step) + 1]);
  const back = () => setStep(STEPS[STEPS.indexOf(step) - 1]);

  return (
    <>
      <AppShell decorative />
      <OnboardingCard>
        <Image
          src="/logos/readywhen-lockup-on-light.webp"
          alt="readywhen"
          translate="no"
          className="notranslate"
          width={132}
          height={22}
          style={{ height: "auto" }}
          priority
        />

        {step === "org" && (
          <OrgNameStep
            domain={session.email?.split("@")[1] ?? null}
            onContinue={(orgName) => {
              update({ orgName });
              next();
            }}
          />
        )}

        {step === "profile" && (
          <ProfileStep
            onContinue={(values) => {
              update(values);
              next();
            }}
          />
        )}

        {step === "explainer" && <ExplainerStep onContinue={next} />}

        {step === "tools" && (
          <ToolsStep
            selected={session.tools}
            other={other}
            onOtherChange={setOther}
            onToggle={(slug) =>
              update({
                tools: session.tools.includes(slug)
                  ? session.tools.filter((item) => item !== slug)
                  : [...session.tools, slug],
              })
            }
            onContinue={() => {
              const extra = other.trim();
              if (extra) update({ tools: [...session.tools, extra] });
              next();
            }}
            onBack={back}
          />
        )}

        {step === "slips" && (
          <SlipsStep
            selected={session.jtbd}
            onSelect={(jtbd) => update({ jtbd })}
            detail={session.jtbdDetail}
            onDetailChange={(jtbdDetail) => update({ jtbdDetail })}
            onContinue={() => router.push("/chat")}
            onBack={back}
          />
        )}
      </OnboardingCard>
    </>
  );
}
