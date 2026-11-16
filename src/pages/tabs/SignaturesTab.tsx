import { RecordsTable } from "../../components/RecordsTable";
import { useState } from "react";
import { FileSignature, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { relativeTime, uid, type Template } from "../../data";
import { useStore, type CustomerScope } from "../../store";
import { TablePagination } from "../../components/TablePagination";
import { Button, Card, EmptyState, IconButton, Modal } from "../../components/ui";

const pageSizes = [5, 10, 25];

export function SignaturesTab({ scope }: { scope: CustomerScope }) {
  const { customer, templates } = scope;
  const { navigate, deleteTemplate, toast } = useStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirm, setConfirm] = useState<Template | null>(null);
  const openTemplate = (templateId: string) =>
    navigate({ name: "template", customerId: customer.id, templateId });
  const assign = () => navigate({ name: "assign", customerId: customer.id });
  const list = [...templates].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const currentPage = Math.min(page, Math.max(1, Math.ceil(list.length / pageSize)));
  const start = (currentPage - 1) * pageSize;

  return (
    <Card className="@container overflow-hidden">
      <div className="records-toolbar flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Signature templates</h2>
          <p className="mt-0.5 text-sm text-brio-muted">
            Manage reusable signatures for {customer.domain}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            icon={<Send className="size-4" />}
            onClick={() => assign()}
            disabled={!templates.some((t) => t.html.trim())}
          >
            Assign Signature
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={() => openTemplate(uid("tpl"))}
          >
            Create Template
          </Button>
        </div>
      </div>
      {list.length ? (
        <div className="overflow-x-auto">
          <RecordsTable aria-label="Signature templates" className="table-fixed">
            <thead>
              <tr>
                <th scope="col" className="hidden w-16 @min-[42rem]:table-cell">
                  No.
                </th>
                <th scope="col" className="@max-[42rem]:pl-5">
                  Template
                </th>
                <th scope="col" className="hidden w-2/5 @min-[38rem]:table-cell">
                  Description
                </th>
                <th scope="col" className="hidden w-36 @min-[38rem]:table-cell">
                  Last updated
                </th>
                <th scope="col" className="w-28 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {list.slice(start, start + pageSize).map((template, index) => (
                <tr key={template.id}>
                  <td className="hidden text-brio-muted tabular-nums @min-[42rem]:table-cell">
                    {start + index + 1}
                  </td>
                  <td className="min-w-0 [overflow-wrap:anywhere] @max-[42rem]:pl-5">
                    <p className="font-semibold">{template.name || "Untitled template"}</p>
                    <div className="mt-1 space-y-1 text-xs text-brio-muted @min-[38rem]:hidden">
                      {template.description && <p>{template.description}</p>}
                      <p>Edited {relativeTime(template.updatedAt)}</p>
                    </div>
                  </td>
                  <td className="hidden max-w-md text-brio-muted [overflow-wrap:anywhere] @min-[38rem]:table-cell">
                    {template.description || "—"}
                  </td>
                  <td className="hidden whitespace-nowrap text-brio-muted @min-[38rem]:table-cell">
                    <time dateTime={template.updatedAt}>{relativeTime(template.updatedAt)}</time>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <IconButton
                        label={"Edit " + (template.name || "template")}
                        onClick={() => openTemplate(template.id)}
                      >
                        <Pencil className="size-4" />
                      </IconButton>
                      <IconButton
                        label={"Delete " + (template.name || "template")}
                        onClick={() => setConfirm(template)}
                      >
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </RecordsTable>
        </div>
      ) : (
        <EmptyState
          icon={<FileSignature className="size-5" />}
          title="No templates yet"
          description="Create a template to assign a signature to users in this directory."
        />
      )}
      {list.length > 0 && (
        <TablePagination
          label="Signature template pagination"
          noun="template"
          total={list.length}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={setPage}
          pageSizes={pageSizes}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Delete template?"
        footer={
          <>
            <Button onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!confirm) return;
                deleteTemplate(confirm.id);
                toast(`Deleted “${confirm.name}”`);
                setConfirm(null);
              }}
            >
              Delete template
            </Button>
          </>
        }
      >
        <p className="text-sm text-brio-muted">
          <strong className="text-brio-ink">{confirm?.name}</strong> will be removed from this
          customer's templates. Previous assignments and activity remain in the record.
        </p>
      </Modal>
    </Card>
  );
}
