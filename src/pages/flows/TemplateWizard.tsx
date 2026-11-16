import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { newTemplate, type Template } from "../../data";
import { useCustomer, useStore } from "../../store";
import { ActionFooter } from "../../components/FormLayout";
import { SignatureEditor } from "../../components/SignatureEditor";
import { SignaturePreview } from "../../components/SignaturePreview";
import { Button, Card, Field, Input, Textarea } from "../../components/ui";
const DESCRIPTION_LIMIT = 250;

export function TemplateWizard({
  customerId,
  templateId,
}: {
  customerId: string;
  templateId: string;
}) {
  const { navigate, saveTemplate, toast } = useStore();
  const { customer, users, templates } = useCustomer(customerId);
  const existing = templates.find((t) => t.id === templateId);
  const [draft, setDraft] = useState(() => existing ?? newTemplate(customerId, templateId));
  const [previewId, setPreviewId] = useState(
    users.find((u) => u.status === "active")?.id ?? users[0]?.id ?? "",
  );
  const [attempted, setAttempted] = useState(false);
  const update = (patch: Partial<Template>) => setDraft((previous) => ({ ...previous, ...patch }));
  const exit = () => navigate({ name: "customer", id: customerId, tab: "signatures" });
  if (!customer) return null;

  const hasSignature =
    /<img\b/i.test(draft.html) || Boolean(draft.html.replace(/<[^>]*>|&nbsp;|&#160;/gi, "").trim());
  const error = !draft.name.trim()
    ? "Enter a template name."
    : draft.description.length > DESCRIPTION_LIMIT
      ? "Shorten the description to 250 characters."
      : !hasSignature
        ? "Enter a signature."
        : undefined;

  function save(assign: boolean) {
    setAttempted(true);
    if (error) return;
    const { id, customerId, name, description, html, notify, notifyWhen, updatedAt } = draft;
    saveTemplate({
      id,
      customerId,
      name: name.trim(),
      description: description.trim(),
      html,
      notify,
      notifyWhen,
      updatedAt,
    });
    toast(existing ? "Template updated" : "Template saved");
    if (assign) navigate({ name: "assign", customerId, templateId: draft.id });
    else exit();
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="grid min-w-0 flex-1 content-start gap-5 p-5">
        <Card className="divide-y divide-brio-subtle">
          <section aria-labelledby="template-information" className="p-5">
            <h2 id="template-information" className="mb-4 text-base font-semibold">
              Template information
            </h2>
            <div className="grid items-start gap-4 @min-[40rem]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <Field
                label="Template name"
                required
                error={attempted && !draft.name.trim() ? error : undefined}
              >
                <Input
                  required
                  aria-invalid={attempted && !draft.name.trim()}
                  value={draft.name}
                  onChange={(e) => update({ name: e.target.value })}
                />
              </Field>
              <Field
                label="Description"
                optional
                hint={draft.description.length + " / " + DESCRIPTION_LIMIT + " characters"}
                error={
                  attempted && draft.description.length > DESCRIPTION_LIMIT ? error : undefined
                }
              >
                <Textarea
                  rows={1}
                  maxLength={DESCRIPTION_LIMIT}
                  className="h-10 resize-none"
                  aria-invalid={attempted && draft.description.length > DESCRIPTION_LIMIT}
                  value={draft.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </Field>
            </div>
          </section>
          <section aria-labelledby="signature-design">
            <div className="border-b border-brio-subtle px-5 py-4">
              <h2 id="signature-design" className="text-base font-semibold">
                Signature design
              </h2>
              <p className="mt-1 text-sm text-brio-muted">
                Edit the signature and check how it appears for a directory user.
              </p>
            </div>
            <div className="grid min-w-0 auto-rows-[31.5rem] gap-px bg-brio-subtle @min-[56rem]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <SignatureEditor html={draft.html} onChange={(html) => update({ html })} />
              <SignaturePreview
                embedded
                html={draft.html}
                customer={customer}
                users={users}
                userId={previewId}
                onUserChange={setPreviewId}
              />
            </div>
          </section>
        </Card>
      </div>
      <ActionFooter
        left={<Button onClick={exit}>Cancel</Button>}
        center={
          attempted && error ? (
            <span role="alert" className="text-brio-danger-ink">
              {error}
            </span>
          ) : undefined
        }
        right={
          <>
            <Button onClick={() => save(false)}>
              {existing ? "Save changes" : "Save as Template"}
            </Button>
            <Button variant="primary" onClick={() => save(true)}>
              Save &amp; Assign <ArrowRight className="size-4" />
            </Button>
          </>
        }
      />
    </div>
  );
}
