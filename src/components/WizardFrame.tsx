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
        center={
          <nav aria-label="Workflow progress">
            <ol className="flex flex-wrap items-center justify-center gap-2">
              {steps.map((label, index) => {
                const status = index < step ? "Completed" : index === step ? "Current" : "Upcoming";
                const content = (
                  <>
                    <span
                      aria-hidden
                      className={cx(
                        "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                        status === "Current" && "bg-brio-primary text-brio-ink",
                        status === "Completed" && "bg-brio-primary/25 text-brio-ink",
                        status === "Upcoming" && "bg-brio-hover text-brio-muted",
                      )}
                    >
                      {status === "Completed" ? <Check className="size-3.5" /> : index + 1}
                    </span>
                    <span className="sr-only">{status}: </span>
                    {label}
                  </>
                );
                return (
                  <li key={label} aria-current={index === step ? "step" : undefined}>
                    {index < step ? (
                      <button
                        type="button"
                        onClick={() => onStep(index)}
                        className="flex items-center gap-2 rounded-brio-control px-1 py-1 text-xs text-brio-ink hover:bg-brio-hover focus-visible:outline-2 focus-visible:outline-brio-focus"
                      >
                        {content}
                      </button>
                    ) : (
                      <span
                        className={cx(
                          "flex items-center gap-2 px-1 py-1 text-xs",
                          index === step ? "font-semibold text-brio-ink" : "text-brio-muted",
                        )}
                      >
                        {content}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        }
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
