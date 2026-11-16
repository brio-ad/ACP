import type { ReactNode } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import {
  VARIABLES,
  fullName,
  usedVariables,
  variableValues,
  type Assignment,
  type Customer,
  type DirectoryUser,
} from "../data";
import { Card } from "./ui";

export type PreCheck = { status: "warn" | "fail"; title: string; detail: string };

const plural = (n: number, s: string) => `${n} ${s}${n === 1 ? "" : "s"}`;

export function signatureChecks(
  customer: Customer,
  html: string,
  recipients: DirectoryUser[],
  assignments: Record<string, Assignment>,
): PreCheck[] {
  const active = recipients.filter((u) => u.status === "active");
  const suspended = recipients.length - active.length;
  const vars = usedVariables(html);
  const gaps = vars
    .map((k) => ({
      label: VARIABLES.find((v) => v.key === k)?.label ?? k,
      missing: active.filter((u) => !variableValues(u, customer)[k]),
    }))
    .filter((g) => g.missing.length);
  const unknown = vars.filter((k) => !VARIABLES.some((v) => v.key === k));
  const insecure = (html.match(/src="http:\/\//g) ?? []).length;
  const replacing = active.filter((u) => assignments[u.id]).length;

  const checks: (PreCheck | null)[] = [
    customer.status !== "active"
      ? {
          status: "fail",
          title: "Directory is not ready",
          detail: "Set up the customer’s demo directory before deploying.",
        }
      : null,
    html.length > 10000
      ? {
          status: "fail",
          title: "Signature too long",
          detail: `${html.length.toLocaleString()} characters; Gmail allows 10,000.`,
        }
      : null,
    active.length === 0
      ? {
          status: "fail",
          title: "No active recipients",
          detail: "Every selected user is suspended or nobody is selected.",
        }
      : null,
    ...(suspended
      ? [
          {
            status: "warn" as const,
            title: `${plural(suspended, "suspended user")} will be skipped`,
            detail: "Gmail settings cannot be changed for suspended accounts.",
          },
        ]
      : []),
    ...gaps.map((g) => ({
      status: "warn" as const,
      title: `${g.label} is empty for ${plural(g.missing.length, "user")}`,
      detail: `${g.missing.slice(0, 3).map(fullName).join(", ")}${g.missing.length > 3 ? ` and ${g.missing.length - 3} more` : ""}. The field will render blank.`,
    })),
    ...(unknown.length
      ? [
          {
            status: "warn" as const,
            title: "Unknown fields",
            detail: `${unknown.map((k) => `{{${k}}}`).join(", ")} will render blank.`,
          },
        ]
      : []),
    ...(insecure
      ? [
          {
            status: "warn" as const,
            title: "Non-HTTPS images",
            detail: `${plural(insecure, "image")} use http://. Gmail may block them.`,
          },
        ]
      : []),
    ...(replacing
      ? [
          {
            status: "warn" as const,
            title: `${plural(replacing, "existing signature")} will be replaced`,
            detail: "These users already have a signature in the demo records.",
          },
        ]
      : []),
  ];
  return checks.filter((check): check is PreCheck => check !== null);
}

export function ChecksCard({ checks }: { checks: PreCheck[] }) {
  const warn = checks.filter((c) => c.status === "warn").length;
  const fail = checks.filter((c) => c.status === "fail").length;
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
        <h2 className="text-sm font-semibold">Assignment checks</h2>
        <span className="text-xs text-slate-500">
          {fail ? (
            <span className="font-medium text-rose-600">{fail} blocking</span>
          ) : (
            "No blocking issues"
          )}
          {warn > 0 && <span className="text-amber-600"> · {plural(warn, "warning")}</span>}
        </span>
      </div>
      <ul className="divide-y divide-slate-100">
        {checks.map((c, i) => (
          <li key={i} className="flex gap-3 px-5 py-3">
            {c.status === "warn" ? (
              <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-amber-500" />
            ) : (
              <XCircle className="mt-0.5 size-4.5 shrink-0 text-rose-500" />
            )}
            <div className="min-w-0 break-words">
              <p className="text-[13.5px] font-medium text-slate-900">{c.title}</p>
              <p className="mt-0.5 text-[13px] text-slate-500">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function SummaryCard({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <Card className="divide-y divide-slate-100 text-[13px]">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-3 px-5 py-3"
        >
          <span className="text-slate-500">{label}</span>
          <span className="min-w-0 break-words text-slate-800">{value}</span>
        </div>
      ))}
    </Card>
  );
}
