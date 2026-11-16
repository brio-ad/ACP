import { useState, type ReactNode } from "react";
import { ArrowRight, CalendarClock, Hand, Play } from "lucide-react";
import { selectedUsers, signatureResults, type RecipientSelection } from "../../data";
import { useCustomer, useStore } from "../../store";
import { Button, Field, Input, Select } from "../../components/ui";
import { SignaturePreview } from "../../components/SignaturePreview";
import { RecipientPicker } from "../../components/RecipientPicker";
import { FormSection } from "../../components/FormLayout";
import { NotifyPicker } from "./NotifyPicker";
import { ChecksCard, SummaryCard, signatureChecks } from "../../components/Preflight";
import { BatchModal, type BatchJob } from "../../components/BatchModal";
import { StepHeading, WizardFrame } from "../../components/WizardFrame";

const STEPS = ["Template and recipients", "Execution", "Review"] as const;
const timeZone = "Asia/Kolkata";

export function AssignWizard({
  customerId,
  templateId,
}: {
  customerId: string;
  templateId?: string;
}) {
  const { navigate } = useStore();
  const { customer, users, templates, assignments } = useCustomer(customerId);
  const usable = templates.filter((t) => t.html.trim());
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState<RecipientSelection>({ all: false, ids: [] });
  const [pickedTemplate, setPickedTemplate] = useState(templateId ?? "");
  const [execution, setExecution] = useState<"manual" | "scheduled">("manual");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [time, setTime] = useState("09:00");
  const [notificationSelection, setNotificationSelection] = useState<string[] | null>(null);
  const [notificationTiming, setNotificationTiming] = useState<"always" | "errors" | null>(null);
  const [previewId, setPreviewId] = useState("");
  const [error, setError] = useState("");
  const [job, setJob] = useState<BatchJob | null>(null);
  if (!customer) return null;

  const template = usable.find((t) => t.id === pickedTemplate);
  const recipients = selectedUsers(selection, users);
  const checks = signatureChecks(customer, template?.html ?? "", recipients, assignments);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone }).format(new Date());
  const target = selection.all
    ? `Entire directory · ${recipients.length} selected${selection.ids.length ? ` (${selection.ids.length} excluded)` : ""}`
    : recipients.length === 1
      ? recipients[0].email
      : `${recipients.length} selected users`;
  const selectionError = !template
    ? "Select a saved template."
    : !recipients.length
      ? "Select at least one user."
      : "";
  const scheduleError =
    execution === "scheduled" && (!start || !end || !time || start < today || end < start)
      ? "Enter a daily time and a date range that starts today or later."
      : "";
  const notify = notificationSelection ?? template?.notify ?? [];
  const notifyWhen = notificationTiming ?? template?.notifyWhen ?? "always";
  const notifyRows: [string, ReactNode][] = [
    [
      "Notifications",
      notify.length ? (
        <div>
          <p>
            {notifyWhen === "errors" ? "On failures only" : "After deployment"} · email unavailable
            in demo
          </p>
          <ul className="mt-1 text-brio-muted">
            {notify.map((email) => (
              <li key={email}>{email}</li>
            ))}
          </ul>
        </div>
      ) : (
        "None"
      ),
    ],
  ];
  const exit = () => navigate({ name: "customer", id: customerId, tab: "signatures" });

  function goTo(next: number) {
    if (next > 0 && selectionError) {
      setStep(0);
      setError(selectionError);
    } else if (next > 1 && scheduleError) {
      setStep(1);
      setError(scheduleError);
    } else {
      setError("");
      setStep(next);
    }
    document.getElementById("main-scroll")?.scrollTo({ top: 0 });
  }

  function deploy() {
    if (
      !template ||
      selectionError ||
      execution !== "manual" ||
      checks.some((c) => c.status === "fail")
    )
      return;
    setJob({
      customerId,
      kind: "signature",
      name: template.name,
      detail: target,
      templateId: template.id,
      users: recipients,
      notification: notify.length ? { recipients: notify, when: notifyWhen } : undefined,
      run: () => {
        const results = signatureResults(recipients);
        const at = new Date().toISOString();
        return {
          results,
          changes: {
            assignments: Object.fromEntries(
              results
                .filter((r) => r.status === "applied")
                .map((r) => [
                  r.userId,
                  { templateId: template.id, templateName: template.name, html: template.html, at },
                ]),
            ),
          },
        };
      },
    });
  }

  return (
    <WizardFrame
      steps={STEPS}
      step={step}
      onStep={goTo}
      onExit={exit}
      footerRight={
        step < 2 ? (
          <Button variant="primary" onClick={() => goTo(step + 1)}>
            {step === 0 ? "Continue" : "Review assignment"} <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            variant="primary"
            icon={<Play className="size-4" />}
            disabled={execution === "scheduled" || checks.some((c) => c.status === "fail")}
            onClick={deploy}
          >
            {execution === "scheduled" ? "Scheduler unavailable" : "Run demo deployment"}
          </Button>
        )
      }
    >
      {error && (
        <p role="alert" className="mb-4 text-sm text-brio-danger-ink">
          {error}
        </p>
      )}
      {step === 0 && (
        <>
          <div className="grid gap-5">
            <div className="grid items-end gap-4 @min-[42rem]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <StepHeading
                className=""
                title="Recipients"
                description={"Choose who receives this signature in " + customer.domain + "."}
              />
              <Field label="Signature template" required>
                <Select
                  required
                  aria-invalid={Boolean(error && !template)}
                  value={pickedTemplate}
                  onChange={(e) => setPickedTemplate(e.target.value)}
                >
                  <option value="">Select a template</option>
                  {usable.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || "Untitled template"}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <RecipientPicker users={users} selection={selection} onChange={setSelection} />
            <FormSection
              title="Deployment notifications"
              description="Choose who should receive an update when a deployment runs. Email delivery is unavailable in this demo."
            >
              <div className="grid items-start gap-4 @min-[44rem]:grid-cols-2">
                <NotifyPicker
                  customer={customer}
                  users={users}
                  value={notify}
                  onChange={setNotificationSelection}
                />
                {!!notify.length && (
                  <Field label="When to notify">
                    <Select
                      value={notifyWhen}
                      onChange={(e) =>
                        setNotificationTiming(e.target.value === "errors" ? "errors" : "always")
                      }
                    >
                      <option value="always">After every deployment</option>
                      <option value="errors">Only when deployment has failures</option>
                    </Select>
                  </Field>
                )}
              </div>
            </FormSection>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <StepHeading
            title="Choose when to deploy"
            description="Run manually after review, or configure a daily time and date range for a scheduled deployment."
          />
          <div className="grid gap-5">
            <FormSection title="Execution mode">
              <fieldset className="grid min-w-0 gap-3 @min-[35rem]:grid-cols-2">
                <legend className="sr-only">Execution mode</legend>
                {(
                  [
                    ["manual", "Manual", "Start the deployment yourself after review.", Hand],
                    [
                      "scheduled",
                      "Scheduled",
                      "Set a daily time within a date range.",
                      CalendarClock,
                    ],
                  ] as const
                ).map(([value, label, description, Icon]) => (
                  <label
                    key={value}
                    className="flex min-w-0 cursor-pointer items-start gap-3 rounded-brio-control border border-brio-border p-3 hover:bg-brio-hover has-checked:border-brio-focus has-checked:bg-brio-primary/10"
                  >
                    <input
                      type="radio"
                      name="deployment-mode"
                      className="mt-1 size-4 shrink-0 accent-brio-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brio-focus"
                      checked={execution === value}
                      onChange={() => setExecution(value)}
                    />
                    <div className="min-w-0">
                      <span className="flex items-center gap-2 font-semibold">
                        <Icon className="size-4 shrink-0" aria-hidden />
                        {label}
                      </span>
                      <p className="mt-1 text-xs text-brio-muted">{description}</p>
                    </div>
                  </label>
                ))}
              </fieldset>
              {execution === "scheduled" && (
                <div className="mt-4 border-t border-brio-subtle pt-4">
                  <div className="grid items-start gap-4 @min-[35rem]:grid-cols-3">
                    <Field label="Start date" required>
                      <Input
                        required
                        type="date"
                        min={today}
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                      />
                    </Field>
                    <Field label="End date" required>
                      <Input
                        required
                        type="date"
                        min={start || today}
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                      />
                    </Field>
                    <Field label="Daily time (IST)" required>
                      <Input
                        required
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </Field>
                  </div>
                  <p className="mt-4 text-sm text-brio-muted">
                    You can review these settings. An automatic deployment requires a connected
                    scheduler.
                  </p>
                </div>
              )}
            </FormSection>
          </div>
        </>
      )}
      {step === 2 && template && (
        <>
          <StepHeading
            title="Review assignment"
            description={
              execution === "scheduled"
                ? "Scheduling is unavailable. No deployment will be queued."
                : "This demo updates the local assignment records only. Gmail mailboxes and email notifications are unaffected."
            }
          />
          <div className="flow-columns">
            <div className="grid min-w-0 gap-4">
              <SummaryCard
                rows={[
                  ["Template", template.name || "Untitled template"],
                  [
                    "Recipients",
                    recipients.length === 1 ? (
                      target
                    ) : (
                      <details>
                        <summary className="cursor-pointer">{target}</summary>
                        <ul className="mt-2 max-h-44 overflow-auto text-brio-muted">
                          {recipients.map((u) => (
                            <li key={u.id}>{u.email}</li>
                          ))}
                        </ul>
                      </details>
                    ),
                  ],
                  [
                    "Execution",
                    execution === "manual"
                      ? "Manual"
                      : `Scheduled · daily at ${time} IST · ${start} to ${end}`,
                  ],
                  ...notifyRows,
                ]}
              />
              {checks.length > 0 && <ChecksCard checks={checks} />}
            </div>
            <SignaturePreview
              title="Recipient preview"
              html={template.html}
              customer={customer}
              users={recipients}
              userId={
                recipients.some((u) => u.id === previewId) ? previewId : (recipients[0]?.id ?? "")
              }
              onUserChange={setPreviewId}
            />
          </div>
        </>
      )}
      <BatchModal
        job={job}
        onClose={() => {
          setJob(null);
          exit();
        }}
      />
    </WizardFrame>
  );
}
