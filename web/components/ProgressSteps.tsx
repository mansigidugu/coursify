"use client";

type StepKey = "research" | "judge" | "build";

const STEPS: { key: StepKey; icon: string; label: string; match: RegExp }[] = [
  { key: "research", icon: "🔍", label: "Researching", match: /research/i },
  { key: "judge", icon: "⚖️", label: "Fact-checking", match: /judge|evaluat/i },
  { key: "build", icon: "✍️", label: "Writing", match: /writ|content builder/i },
];

export function activeStepFromText(text: string): StepKey | null {
  for (const step of STEPS) {
    if (step.match.test(text)) return step.key;
  }
  return null;
}

export default function ProgressSteps({
  statusText,
  activeStep,
  compact = false,
}: {
  statusText: string;
  activeStep: StepKey | null;
  compact?: boolean;
}) {
  const activeIndex = STEPS.findIndex((s) => s.key === activeStep);

  if (compact) {
    return (
      <div className="flex w-full items-center gap-3 animate-fade-up">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        <p className="text-sm text-foreground/80">{statusText}</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-up">
      <div className="flex items-center justify-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
        </span>
        <p className="text-sm font-medium text-foreground/80">{statusText}</p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((step, i) => {
          const state =
            activeIndex === -1
              ? "pending"
              : i < activeIndex
              ? "done"
              : i === activeIndex
              ? "active"
              : "pending";

          return (
            <div key={step.key} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-full border text-lg transition-all duration-300",
                    state === "active"
                      ? "border-accent bg-accent/10 shadow-[0_0_0_4px_rgba(119,155,189,0.18)] scale-110"
                      : state === "done"
                      ? "border-accent/40 bg-accent/5"
                      : "border-border bg-card",
                  ].join(" ")}
                >
                  {state === "done" ? "✅" : step.icon}
                </div>
                <span
                  className={[
                    "text-xs font-medium",
                    state === "pending" ? "text-muted" : "text-foreground",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    "h-px w-8 sm:w-16 transition-colors duration-300",
                    i < activeIndex ? "bg-accent/50" : "bg-border",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
