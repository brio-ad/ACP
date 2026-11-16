import { useState, type ReactNode } from "react";
import { ArrowRight, Play } from "lucide-react";
import { selectedUsers, signatureResults, type RecipientSelection } from "../../data";
import { useCustomer, useStore } from "../../store";
import { Button, Card, Field, Input, Select } from "../../components/ui";
import { SignaturePreview } from "../../components/SignaturePreview";
import { RecipientPicker } from "../../components/RecipientPicker";
import { NotifyPicker } from "./NotifyPicker";
import { ChecksCard, SummaryCard, signatureChecks } from "../../components/Preflight";
import { BatchModal, type BatchJob } from "../../components/BatchModal";
import { StepHeading, WizardFrame } from "../../components/WizardFrame";

const STEPS = ["Assignment setup", "Review"] as const;
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
    if (next > 0 && (selectionError || scheduleError)) {
      setError(selectionError || scheduleError);
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
        step === 0 ? (
          <Button variant="primary" onClick={() => goTo(step + 1)}>
            Review assignment <ArrowRight className="size-4" />
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
        <Card className="@container">
          <section
            aria-labelledby="assignment-templates"
            className="border-b border-brio-subtle p-5"
          >
            <h2 id="assignment-templates" className="text-base font-semibold">
              Signature Templates
            </h2>
            <div className="mt-4 grid items-start gap-4 @min-[35rem]:grid-cols-2">
              <Field label="Signature template" required>
                <Select
                  required
                  aria-invalid={Boolean(error && !template)}
                  value={pickedTemplate}
                  onChange={(event) => setPickedTemplate(event.target.value)}
                >
                  <option value="">Select a template</option>
                  {usable.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name || "Untitled template"}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="When to deploy">
                <Select
                  value={execution}
                  onChange={(event) =>
                    setExecution(event.target.value === "scheduled" ? "scheduled" : "manual")
                  }
                >
                  <option value="manual">Manual</option>
                  <option value="scheduled">Scheduled</option>
                </Select>
              </Field>
            </div>
            {execution === "scheduled" && (
              <div className="mt-4">
                <div className="grid items-start gap-4 @min-[35rem]:grid-cols-3">
                  <Field label="Start date" required>
                    <Input
                      required
                      type="date"
                      min={today}
                      value={start}
                      onChange={(event) => setStart(event.target.value)}
                    />
                  </Field>
                  <Field label="End date" required>
                    <Input
                      required
                      type="date"
                      min={start || today}
                      value={end}
                      onChange={(event) => setEnd(event.target.value)}
                    />
                  </Field>
                  <Field label="Daily time (IST)" required>
                    <Input
                      required
                      type="time"
                      value={time}
                      onChange={(event) => setTime(event.target.value)}
                    />
                  </Field>
                </div>
                <p className="mt-2 text-xs text-brio-muted">
                  Automatic deployment requires a connected scheduler.
                </p>
              </div>
            )}
          </section>
          <RecipientPicker users={users} selection={selection} onChange={setSelection} />
          <section
            aria-labelledby="assignment-notifications"
            className="border-t border-brio-subtle p-5"
          >
            <h2 id="assignment-notifications" className="text-base font-semibold">
              Notifications
            </h2>
            <p className="mt-1 mb-4 text-sm text-brio-muted">
              Choose who should receive an update when a deployment runs. Email delivery is
              unavailable in this demo.
            </p>
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
          </section>
        </Card>
      )}
      {step === 1 && template && (
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
