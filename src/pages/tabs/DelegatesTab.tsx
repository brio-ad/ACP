import { useState } from "react";
import { Trash2, UserCog, UserPlus } from "lucide-react";
import { formatDate, fullName, uid, type Delegation, type DirectoryUser } from "../../data";
import { useStore, type BatchCommit, type CustomerScope } from "../../store";
import { FormSection } from "../../components/FormLayout";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Modal,
  SearchInput,
  Select,
} from "../../components/ui";

export function DelegatesTab({ scope }: { scope: CustomerScope }) {
  const { customer, users, delegations } = scope;
  const { agent, commitBatch, toast } = useStore();
  const [ownerId, setOwnerId] = useState("");
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [removing, setRemoving] = useState<Delegation | null>(null);
  const byId = new Map(users.map((user) => [user.id, user]));
  const owner = byId.get(ownerId);
  const mailbox = owner?.email ?? "";
  const rows = owner
    ? delegations
        .filter((d) => d.ownerId === owner.id || d.ownerId.toLowerCase() === mailbox.toLowerCase())
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const assigned = new Set(rows.map((d) => d.delegateId));
  const mailboxOwners = [...users].sort((a, b) => fullName(a).localeCompare(fullName(b)));
  const available = users.filter(
    (user) => user.status === "active" && user.id !== ownerId && !assigned.has(user.id),
  );
  const matching = available.filter((user) =>
    `${fullName(user)} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const picked = available.filter((user) => selected.includes(user.id));
  const mailboxFor = (d: Delegation) => byId.get(d.ownerId)?.email ?? d.ownerId;

  function record(
    action: "delegate-added" | "delegate-removed",
    entries: Delegation[],
    changes: BatchCommit,
  ) {
    const addingAccess = action === "delegate-added";
    commitBatch(
      {
        id: uid("log"),
        customerId: customer.id,
        kind: "delegation",
        action,
        name:
          entries.length === 1
            ? (byId.get(entries[0].delegateId)?.email ?? entries[0].delegateId)
            : `${entries.length} directory users`,
        detail: mailboxFor(entries[0]),
        templateId: null,
        trigger: "manual",
        triggeredBy: agent?.email ?? "agent",
        startedAt: new Date().toISOString(),
        durationMs: 0,
        results: entries.map((d) => {
          const user = byId.get(d.delegateId);
          return {
            userId: d.delegateId,
            name: user ? fullName(user) : d.delegateId,
            email: user?.email ?? d.delegateId,
            status: "applied",
            message: `Demo delegate record ${addingAccess ? "added for" : "removed for"} ${mailboxFor(d)}`,
          };
        }),
      },
      changes,
    );
  }

  function add() {
    if (!owner || owner.status !== "active" || !picked.length) return;
    const createdAt = new Date().toISOString();
    const entries = picked.map((user) => ({
      id: uid("dlg"),
      customerId: customer.id,
      ownerId,
      delegateId: user.id,
      createdAt,
    }));
    record("delegate-added", entries, { addDelegations: entries });
    setAdding(false);
    toast(entries.length === 1 ? "Demo delegate added" : `${entries.length} demo delegates added`);
  }

  return (
    <div className="grid gap-5">
      <FormSection
        title="Mailbox delegation"
        description="Select a mailbox owner to see who has access. Changes update demo records only."
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 basis-56 sm:max-w-lg">
            <Field label="Mailbox owner">
              <Select
                value={ownerId}
                disabled={!mailboxOwners.length}
                onChange={(e) => setOwnerId(e.target.value)}
              >
                <option value="">
                  {mailboxOwners.length
                    ? "Select a user from the directory"
                    : "No directory users available"}
                </option>
                {mailboxOwners.map((user) => (
                  <option key={user.id} value={user.id}>
                    {fullName(user)} · {user.email}
                    {user.status === "suspended" ? " (suspended)" : ""}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button
            variant="primary"
            icon={<UserPlus className="size-4" />}
            disabled={owner?.status !== "active"}
            onClick={() => {
              setQuery("");
              setSelected([]);
              setAdding(true);
            }}
          >
            Add delegates
          </Button>
        </div>
        {owner?.status === "suspended" && (
          <p className="mt-3 text-sm text-brio-muted">
            This mailbox is suspended. You can review or remove existing delegates.
          </p>
        )}
      </FormSection>

      <Card className="@container overflow-hidden">
        <div className="records-toolbar">
          <h2 className="text-base font-semibold tracking-tight">
            Assigned delegates{" "}
            <span className="ml-1 text-sm font-normal text-slate-500">
              {owner ? rows.length : ""}
            </span>
          </h2>
        </div>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table aria-label="Assigned delegates" className="data-table records-table">
              <thead>
                <tr>
                  <th scope="col">Delegate</th>
                  <th scope="col" className="hidden @min-[34rem]:table-cell">
                    Status
                  </th>
                  <th scope="col" className="hidden @min-[34rem]:table-cell">
                    Date added
                  </th>
                  <th scope="col" className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => {
                  const status = d.status ? (
                    <Badge tone={d.status === "active" ? "green" : "amber"}>
                      {d.status === "active" ? "Active" : "Pending"}
                    </Badge>
                  ) : null;
                  return (
                    <tr key={d.id}>
                      <td className="min-w-0">
                        <Person user={byId.get(d.delegateId)} fallback={d.delegateId} />
                        <div className="mt-1 pl-11 text-xs text-brio-muted @min-[34rem]:hidden">
                          {status}
                          <p className="mt-1">Added {formatDate(d.createdAt)}</p>
                        </div>
                      </td>
                      <td className="hidden @min-[34rem]:table-cell">{status ?? "—"}</td>
                      <td className="hidden text-brio-muted @min-[34rem]:table-cell">
                        <time dateTime={d.createdAt}>{formatDate(d.createdAt)}</time>
                      </td>
                      <td className="w-px text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-brio-danger-ink hover:bg-brio-danger-bg"
                          aria-label={
                            "Remove delegate " + (byId.get(d.delegateId)?.email ?? d.delegateId)
                          }
                          icon={<Trash2 className="size-4" />}
                          onClick={() => setRemoving(d)}
                        >
                          <span className="hidden @min-[34rem]:inline">Remove</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<UserCog className="size-5" />}
            title={owner ? "No delegates assigned" : "Select a mailbox owner"}
            description={
              owner
                ? "Delegates for this mailbox will appear here."
                : "Choose a user to see who has access to their mailbox."
            }
          />
        )}
      </Card>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add delegates"
        footer={
          <>
            <span className="mr-auto self-center text-sm text-slate-500" aria-live="polite">
              {picked.length} selected
            </span>
            <Button onClick={() => setAdding(false)}>Cancel</Button>
            <Button variant="primary" disabled={!picked.length} onClick={add}>
              {picked.length === 1 ? "Add delegate" : "Add delegates"}
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-slate-600 [overflow-wrap:anywhere]">
          Select users to add to the demo delegate list for{" "}
          <strong className="font-medium text-slate-900">{mailbox}</strong>.
        </p>
        <SearchInput
          label="Search directory"
          placeholder="Search by name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-3 max-h-72 divide-y divide-brio-subtle overflow-auto rounded-brio-panel border border-brio-border">
          {matching.length ? (
            matching.map((user) => (
              <label
                key={user.id}
                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-brio-hover has-checked:bg-brio-primary/10"
              >
                <input
                  type="checkbox"
                  aria-label={`Select ${user.email}`}
                  className="size-5 shrink-0 accent-brio-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brio-focus"
                  checked={selected.includes(user.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelected((ids) =>
                      checked ? [...ids, user.id] : ids.filter((id) => id !== user.id),
                    );
                  }}
                />
                <Person user={user} fallback={user.email} />
              </label>
            ))
          ) : (
            <p className="p-4 text-sm text-slate-500">
              {available.length
                ? "No users match your search."
                : "No eligible directory users are available."}
            </p>
          )}
        </div>
      </Modal>

      <Modal
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="Remove delegate?"
        footer={
          <>
            <Button onClick={() => setRemoving(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!removing) return;
                record("delegate-removed", [removing], { removeDelegationIds: [removing.id] });
                setRemoving(null);
                toast("Demo delegate removed");
              }}
            >
              Remove access
            </Button>
          </>
        }
      >
        {removing && (
          <p className="text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">
            Remove the demo delegate record for <strong>{mailboxFor(removing)}</strong> for{" "}
            <strong>{byId.get(removing.delegateId)?.email ?? removing.delegateId}</strong>?
          </p>
        )}
      </Modal>
    </div>
  );
}

function Person({ user, fallback }: { user?: DirectoryUser; fallback: string }) {
  const name = user ? fullName(user) : fallback;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={name} size="sm" />
      <div className="min-w-0 [overflow-wrap:anywhere]">
        <p className="text-sm font-medium text-slate-900">{name}</p>
        {user && <p className="text-xs text-slate-500">{user.email}</p>}
      </div>
    </div>
  );
}
