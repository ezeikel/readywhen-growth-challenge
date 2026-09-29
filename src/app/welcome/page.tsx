"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { AppShell, OnboardingCard } from "@/components/AppShell";
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
  const [step, setStep] = useState<Step>("org");
  const [other, setOther] = useState("");

  useEffect(() => {
    if (ready && !session.signedIn) router.replace("/signup");
  }, [ready, session.signedIn, router]);

  if (!ready || !session.signedIn) return null;

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
