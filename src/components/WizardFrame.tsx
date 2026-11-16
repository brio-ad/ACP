import type { ReactNode } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button, cx } from "./ui";
import { ActionFooter } from "./FormLayout";

/** Shared full-height layout for signature templates and assignments. */
export function WizardFrame({
  steps,
  step,
  onStep,
  onExit,
  children,
  footerLeft,
  footerRight,
}: {
  steps: readonly string[];
  step: number;
  onStep: (i: number) => void;
  onExit: () => void;
  children: ReactNode;
  footerLeft?: ReactNode;
  footerRight: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-5 p-5">
        <nav aria-label="Progress" className="px-1 py-1">
          <ol className="flex flex-wrap items-center gap-2">
            {steps.map((label, i) => (
              <li
                key={label}
                className={cx(
                  "flex min-w-0 items-center gap-2",
                  i < steps.length - 1 && "@min-[40rem]:flex-1",
                )}
              >
                <button
                  type="button"
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => onStep(i)}
                  className={cx(
                    "flex items-center gap-2 rounded-brio-control px-1 py-1 text-xs hover:bg-brio-hover focus-visible:outline-2 focus-visible:outline-brio-focus",
                    i === step ? "font-semibold text-brio-ink" : "text-brio-muted",
                  )}
                >
                  <span
                    className={cx(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      i <= step ? "bg-brio-primary text-brio-ink" : "bg-brio-hover text-brio-muted",
                    )}
                  >
                    {i < step ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  {label}
                </button>
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="mx-1 hidden h-px flex-1 bg-brio-subtle @min-[40rem]:block"
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <ActionFooter
        left={
          <>
            {step > 0 && (
              <Button onClick={() => onStep(step - 1)} icon={<ArrowLeft className="size-4" />}>
                Back
              </Button>
            )}
            <Button variant={step > 0 ? "ghost" : "secondary"} onClick={onExit}>
              Exit
            </Button>
            {footerLeft}
          </>
        }
        center={`Step ${step + 1} of ${steps.length}`}
        right={footerRight}
      />
    </div>
  );
}

export function StepHeading({
  title,
  description,
  className = "mb-4",
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-brio-title font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-brio-muted">{description}</p>
    </div>
  );
}
