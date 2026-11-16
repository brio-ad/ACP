import { AlertTriangle } from "lucide-react";
import {
  VARIABLES,
  fullName,
  renderSignature,
  usedVariables,
  variableValues,
  type Customer,
  type DirectoryUser,
} from "../data";
import { Field, Select, cx } from "./ui";

export function SignaturePreview({
  html,
  customer,
  users,
  userId,
  onUserChange,
  title = "Live preview",
  embedded = false,
}: {
  html: string;
  customer: Customer;
  users: DirectoryUser[];
  userId: string;
  onUserChange?: (id: string) => void;
  title?: string;
  embedded?: boolean;
}) {
  const user = users.find((u) => u.id === userId) ?? users[0];
  const values = user ? variableValues(user, customer) : {};
  const missing = usedVariables(html).filter((k) => !values[k]);

  return (
    <div
      className={cx(
        "flex min-h-0 min-w-0 flex-col overflow-hidden bg-brio-surface",
        embedded ? "h-full" : "rounded-brio-panel border border-brio-subtle",
      )}
    >
      <div className="flex min-h-14 items-center border-b border-brio-subtle px-4 py-3">
        <p className="text-sm font-semibold text-brio-ink">{title}</p>
      </div>
      {onUserChange && user && (
        <div className="border-b border-brio-subtle px-4 py-3">
          <Field label="Preview as">
            <Select value={user?.id} onChange={(e) => onUserChange(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {fullName(u)} — {u.email}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto bg-canvas p-4">
        <div className="min-w-0 overflow-hidden rounded-brio-panel border border-brio-subtle bg-brio-surface">
          <div className="flex items-center justify-between bg-slate-800 px-3.5 py-2 text-[12px] text-white">
            <span>New Message</span>
            <span className="flex gap-1.5 opacity-60">
              <span className="size-2 rounded-full bg-white/70" />
              <span className="size-2 rounded-full bg-white/70" />
            </span>
          </div>
          <div className="divide-y divide-slate-100 text-[12.5px] break-words text-slate-500">
            <p className="px-3.5 py-1.5">
              From <span className="text-slate-800">{user?.email}</span>
            </p>
            <p className="px-3.5 py-1.5">
              To <span className="text-slate-800">client@example.com</span>
            </p>
            <p className="px-3.5 py-1.5 text-slate-800">Following up on our call</p>
          </div>
          <div className="sig-surface px-3.5 pt-3 pb-5">
            <p className="mb-3 text-slate-600">
              Hi there,
              <br />
              Great speaking with you today. Sharing the details below.
            </p>
            <p className="text-slate-400">--</p>
            {user && (
              <div
                className="overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: renderSignature(html, user, customer) }}
              />
            )}
            {!user && (
              <p className="mt-2 text-brio-muted">
                A directory user is needed to preview personalized fields.
              </p>
            )}
          </div>
        </div>
      </div>
      {user && missing.length > 0 && (
        <div className="flex items-start gap-2 border-t border-amber-100 bg-amber-50/70 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="mt-px size-3.5 shrink-0" />
          <span>
            {user ? fullName(user) : "This user"} has no value for{" "}
            {missing.map((k) => VARIABLES.find((v) => v.key === k)?.label ?? k).join(", ")}. The
            field will render empty.
          </span>
        </div>
      )}
    </div>
  );
}
