import { type ReactNode } from "react";
import { AlertTriangle, PlugZap } from "lucide-react";
import { formatDate } from "../data";
import { useCustomer, useStore, type CustomerTab } from "../store";
import { Button, Card, EmptyState, Tabs } from "../components/ui";
import { SignaturesTab } from "./tabs/SignaturesTab";
import { DelegatesTab } from "./tabs/DelegatesTab";
import { UserTable } from "../components/UserTable";
import { HistoryTab } from "./tabs/HistoryTab";

export function CustomerDetailPage({
  id,
  tab = "signatures",
  logId,
}: {
  id: string;
  tab?: CustomerTab;
  logId?: string;
}) {
  const { navigate } = useStore();
  const scope = useCustomer(id);
  const { customer, users } = scope;

  if (!customer)
    return (
      <div className="min-w-0">
        <Card>
          <EmptyState
            icon={<AlertTriangle className="size-5" />}
            title="Customer not found"
            description="It may have been removed."
            action={
              <Button onClick={() => navigate({ name: "customers" })}>Back to customers</Button>
            }
          />
        </Card>
      </div>
    );

  const ready = { ...scope, customer };
  const active = users.filter((u) => u.status === "active").length;
  const setTab = (t: CustomerTab) =>
    navigate({ name: "customer", id, tab: t }, { preserveScroll: true });

  return (
    <div className="min-w-0">
      <Card className="overflow-hidden">
        {customer.status === "error" && (
          <div className="flex items-start gap-2 border-b border-brio-subtle bg-brio-danger-bg px-5 py-3 text-[13px] leading-5 text-brio-danger-ink sm:px-6">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" /> The demo directory connection needs
            attention.
          </div>
        )}
        <dl className="grid auto-rows-fr grid-cols-2 gap-px bg-brio-subtle @min-[44rem]:grid-cols-3 @min-[90rem]:grid-cols-6">
          <Detail
            label="Primary contact"
            primary={customer.contactName}
            secondary={customer.contactEmail}
          />
          <Detail
            label="Directory"
            primary={users.length ? users.length + " users" : "Not loaded"}
            secondary={
              users.length
                ? active + " active · " + (users.length - active) + " suspended"
                : "Directory unavailable"
            }
          />
          <Detail
            label="Plan"
            primary={customer.plan}
            secondary={"Customer since " + formatDate(customer.createdAt).split(",")[0]}
          />
          <Detail label="Service account" primary={customer.serviceAccount || "Not configured"} />
          <Detail label="Website" primary={customer.website || "—"} />
          <Detail label="Company address" primary={customer.address || "—"} />
        </dl>
      </Card>

      <div className="mt-5">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "directory", label: "Directory" },
            {
              value: "signatures",
              label: "Signatures",
            },
            {
              value: "delegates",
              label: "Delegates",
            },
            { value: "history", label: "History" },
          ]}
        />
        <div
          id="customer-tab-panel"
          role="tabpanel"
          aria-labelledby={`customer-tab-${tab}`}
          tabIndex={0}
          className="pt-5"
        >
          {tab === "directory" ? (
            <UserTable users={users} />
          ) : tab === "delegates" && !users.length ? (
            <Card>
              <EmptyState
                icon={<PlugZap className="size-5" />}
                title="Directory unavailable"
                description="Mailbox delegates can be managed once this customer's directory is available."
              />
            </Card>
          ) : tab === "signatures" ? (
            <SignaturesTab scope={ready} />
          ) : tab === "delegates" ? (
            <DelegatesTab scope={ready} />
          ) : (
            <HistoryTab key={logId ?? "history"} scope={ready} initialLogId={logId} />
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  primary,
  secondary,
}: {
  label: string;
  primary: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className="min-w-0 bg-brio-surface px-4 py-3 sm:px-5 sm:py-4">
      <dt className="text-xs font-medium text-brio-muted">{label}</dt>
      <dd className="mt-1 leading-5 [overflow-wrap:anywhere]">
        <p className="text-sm font-medium text-brio-ink">{primary}</p>
        {secondary && <p className="mt-1 text-xs text-brio-muted">{secondary}</p>}
      </dd>
    </div>
  );
}
