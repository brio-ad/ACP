import { useRef, useState } from "react";
import { Download, FileUp, X } from "lucide-react";
import { selectedUsers, type DirectoryUser, type RecipientSelection } from "../data";
import { parseRecipientCsv } from "../recipientCsv";
import { Button, IconButton } from "./ui";
import { UserTable } from "./UserTable";

export function RecipientPicker({
  users,
  selection,
  onChange,
}: {
  users: DirectoryUser[];
  selection: RecipientSelection;
  onChange: (s: RecipientSelection) => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<{
    name: string;
    result: ReturnType<typeof parseRecipientCsv>;
  } | null>(null);
  const [error, setError] = useState("");
  const count = selectedUsers(selection, users).length;
  const entire = users.length > 0 && count === users.length;

  async function importFile(input: File) {
    setError("");
    setReport(null);
    if (!/\.csv$/i.test(input.name) || input.size > 2 * 1024 * 1024) {
      setError("Choose a CSV file no larger than 2 MB. Your selection is unchanged.");
      return;
    }
    setBusy(true);
    try {
      const directory = new Map(users.map((u) => [u.email.toLowerCase(), u.id]));
      const result = parseRecipientCsv(await input.text(), directory);
      if (result.ids.length) onChange({ all: false, ids: result.ids });
      setReport({ name: input.name, result });
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : "Could not read the CSV.") +
          " Your selection is unchanged.",
      );
    } finally {
      setBusy(false);
    }
  }

  function downloadSample() {
    const url = URL.createObjectURL(
      new Blob([["email", ...users.slice(0, 3).map((u) => u.email)].join("\r\n")], {
        type: "text/csv",
      }),
    );
    Object.assign(document.createElement("a"), {
      href: url,
      download: "signature-recipients.csv",
    }).click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <div className="min-w-0">
      <input
        ref={file}
        type="file"
        aria-label="Recipient CSV"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const input = e.target.files?.[0];
          if (input) void importFile(input);
          e.target.value = "";
        }}
      />
      <UserTable
        heading={
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Signature recipients</h2>
              <p className="mt-1 text-xs text-brio-muted">
                Importing a CSV with an email column replaces the current selection.
              </p>
            </div>
            <p aria-live="polite" aria-atomic="true" className="text-sm text-brio-muted">
              <strong className="font-semibold tabular-nums text-brio-ink">
                {count.toLocaleString()}
              </strong>{" "}
              of {users.length.toLocaleString()} selected
            </p>
          </div>
        }
        users={users}
        selection={selection}
        onSelectionChange={onChange}
        toolbarActions={
          <>
            <Button
              variant="ghost"
              disabled={!users.length || busy}
              onClick={() => onChange(entire ? { all: false, ids: [] } : { all: true, ids: [] })}
            >
              {entire ? "Clear selection" : "Select entire directory"}
            </Button>
            <IconButton
              label="Download sample CSV"
              disabled={!users.length}
              onClick={downloadSample}
            >
              <Download className="size-4" />
            </IconButton>
            <Button
              disabled={!users.length || busy}
              icon={<FileUp className="size-4" />}
              onClick={() => file.current?.click()}
            >
              {busy ? "Reading CSV…" : "Upload CSV"}
            </Button>
          </>
        }
        banner={
          <>
            {error && (
              <p
                role="alert"
                className="mb-3 rounded-brio-control bg-brio-danger-bg px-3 py-2 text-sm text-brio-danger-ink"
              >
                {error}
              </p>
            )}
            {report && (
              <div
                role="status"
                className="mb-3 flex items-start justify-between gap-3 rounded-brio-control border border-brio-subtle bg-brio-surface px-3 py-2 text-sm"
              >
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <p>
                    <strong>{report.name}</strong>: {report.result.ids.length} matched ·{" "}
                    {report.result.invalid} invalid · {report.result.duplicates} duplicate ·{" "}
                    {report.result.unmatched.length} unmatched
                  </p>
                  {!report.result.ids.length && (
                    <p className="text-brio-muted">Your selection is unchanged.</p>
                  )}
                  {!!report.result.unmatched.length && (
                    <p className="text-xs text-brio-muted">
                      Unmatched: {report.result.unmatched.slice(0, 3).join(", ")}
                      {report.result.unmatched.length > 3 ? "…" : ""}
                    </p>
                  )}
                </div>
                <IconButton label="Dismiss CSV results" onClick={() => setReport(null)}>
                  <X className="size-4" />
                </IconButton>
              </div>
            )}
          </>
        }
      />
    </div>
  );
}
