"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { consentLines, type Tool } from "@/lib/content";

export const ConsentDialog = ({
  tool,
  onAllow,
  onCancel,
}: Readonly<{ tool: Tool; onAllow: () => void; onCancel: () => void }>) => {
  const scopes = consentLines(tool);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backdropFilter: "blur(4px)",
        backgroundColor: "color-mix(in oklab, var(--foreground) 36%, transparent)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Connect ${tool.name}`}
    >
      <div className="bg-background motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 flex w-full max-w-sm flex-col gap-5 rounded-2xl border p-6 shadow-2xl duration-200">
        <div className="flex items-center gap-3">
          <img src={tool.iconSrc} alt="" className="size-8 object-contain" />
          <div>
            <p className="text-sm font-semibold">Connect {tool.name}</p>
            <p className="text-muted-foreground text-xs">
              Read-only, plus drafts you approve. Disconnect whenever you want.
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-2">
          {scopes.map((scope) => (
            <li key={scope} className="flex items-start gap-2 text-xs">
              <Check className="text-brand mt-0.5 size-3.5 shrink-0" aria-hidden />
              {scope}
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-[11px]">
          This is a mock. No account is contacted and nothing leaves your browser.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="brand" onClick={onAllow}>
            Allow
          </Button>
        </div>
      </div>
    </div>
  );
};
