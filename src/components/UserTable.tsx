import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ListFilter, Users, X } from "lucide-react";
import { fullName, type DirectoryUser, type RecipientSelection } from "../data";
import { TablePagination } from "./TablePagination";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  SearchInput,
  Select,
  cx,
} from "./ui";

export interface Filters {
  department: string;
  orgUnit: string;
  status: string;
}
const EMPTY: Filters = { department: "", orgUnit: "", status: "" };
const PAGE = 15;

export interface ExtraColumn {
  header: string;
  render: (u: DirectoryUser) => ReactNode;
  className?: string;
}

export function UserTable({
  users,
  selection,
  onSelectionChange,
  toolbarActions,
  heading,
  extraColumns = [],
  rowAction,
  banner,
}: {
  users: DirectoryUser[];
  selection?: RecipientSelection;
  onSelectionChange?: (s: RecipientSelection) => void;
  toolbarActions?: ReactNode;
  heading?: ReactNode;
  extraColumns?: ExtraColumn[];
  rowAction?: (u: DirectoryUser) => ReactNode;
  banner?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const close = (e: MouseEvent) =>
      !popRef.current?.contains(e.target as Node) && setFilterOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [filterOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (!q || `${fullName(u)} ${u.email} ${u.title}`.toLowerCase().includes(q)) &&
        (!filters.department || u.department === filters.department) &&
        (!filters.orgUnit || u.orgUnit === filters.orgUnit) &&
        (!filters.status || u.status === filters.status),
    );
  }, [users, query, filters]);

  useEffect(() => setPage(0), [query, filters]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const currentPage = Math.min(page, pages - 1);
  const rows = filtered.slice(currentPage * PAGE, currentPage * PAGE + PAGE);
  const activeFilters = (Object.keys(filters) as (keyof Filters)[]).filter((k) => filters[k]);
  const narrowed = Boolean(query.trim()) || activeFilters.length > 0;

  const selectable = Boolean(selection && onSelectionChange);
  const ids = useMemo(() => new Set(selection?.ids), [selection?.ids]);
  const checked = (id: string) => (selection ? selection.all !== ids.has(id) : false);
  const visibleSelected = filtered.filter((user) => checked(user.id)).length;
  const allVisible = filtered.length > 0 && visibleSelected === filtered.length;

  const departments = useMemo(() => [...new Set(users.map((u) => u.department))].sort(), [users]);
  const orgUnits = useMemo(() => [...new Set(users.map((u) => u.orgUnit))].sort(), [users]);

  function setMany(ids: string[], on: boolean) {
    if (!selection || !onSelectionChange) return;
    const set = new Set(selection.ids);
    // In "all" mode ids are exclusions, so selecting removes from the set.
    const add = selection.all ? !on : on;
    ids.forEach((id) => (add ? set.add(id) : set.delete(id)));
    onSelectionChange({ all: selection.all, ids: [...set] });
  }

  function toggleHeader() {
    if (!onSelectionChange) return;
    if (!narrowed) {
      onSelectionChange(allVisible ? { all: false, ids: [] } : { all: true, ids: [] });
    } else {
      setMany(
        filtered.map((u) => u.id),
        !allVisible,
      );
    }
  }

  return (
    <Card className="@container min-w-0">
      {heading && <div className="px-5 pt-5">{heading}</div>}
      <div className="records-toolbar relative flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          label="Search directory users"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or title"
          className="min-w-0 flex-1 basis-40"
        />
        <div className="shrink-0 sm:relative" ref={popRef}>
          <Button
            icon={<ListFilter className="size-4" />}
            onClick={() => setFilterOpen((o) => !o)}
            className={activeFilters.length ? "ring-accent-200 text-accent-700" : ""}
          >
            Filter
            {activeFilters.length > 0 && (
              <span className="rounded-full bg-accent-600 px-1.5 text-[11px] text-white">
                {activeFilters.length}
              </span>
            )}
          </Button>
          {filterOpen && (
            <div className="absolute top-full right-0 z-30 mt-1.5 w-72 max-w-full space-y-3 rounded-xl bg-white p-4 shadow-xl ring-1 ring-slate-200 sm:max-w-none">
              <FilterSelect
                label="Department"
                value={filters.department}
                options={departments}
                onChange={(v) => setFilters({ ...filters, department: v })}
              />
              <FilterSelect
                label="Organizational unit"
                value={filters.orgUnit}
                options={orgUnits}
                onChange={(v) => setFilters({ ...filters, orgUnit: v })}
              />
              <FilterSelect
                label="Account status"
                value={filters.status}
                options={["active", "suspended"]}
                onChange={(v) => setFilters({ ...filters, status: v })}
              />
              <div className="flex justify-between pt-1">
                <Button size="sm" variant="ghost" onClick={() => setFilters(EMPTY)}>
                  Clear all
                </Button>
                <Button size="sm" variant="primary" onClick={() => setFilterOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
        {toolbarActions && (
          <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            {toolbarActions}
          </div>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-brio-subtle px-5 py-3">
          {activeFilters.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-1 rounded-full bg-white py-0.5 pr-1 pl-2.5 text-xs text-slate-700 ring-1 ring-slate-200"
            >
              <span className="text-slate-400">{k === "orgUnit" ? "OU" : k}:</span> {filters[k]}
              <button
                type="button"
                aria-label={`Remove ${k} filter`}
                onClick={() => setFilters({ ...filters, [k]: "" })}
                className="rounded-full p-0.5 hover:bg-slate-100"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="px-5 pt-3 empty:hidden">{banner}</div>

      {rows.length ? (
        <div className={cx("overflow-auto", selectable && "max-h-[min(48dvh,28rem)]")}>
          <table
            aria-label={selectable ? "Signature recipients" : "Workspace directory"}
            className="data-table records-table"
          >
            <thead className={selectable ? "sticky top-0 z-10" : undefined}>
              <tr>
                {selectable && (
                  <th className="w-12">
                    <Checkbox
                      label={narrowed ? "Select all matching users" : "Select entire directory"}
                      checked={allVisible}
                      indeterminate={!allVisible && visibleSelected > 0}
                      onChange={toggleHeader}
                    />
                  </th>
                )}
                <th scope="col">User</th>
                <th className="hidden font-medium @min-[38rem]:table-cell">Title</th>
                <th className="hidden font-medium @min-[38rem]:table-cell">Department</th>
                <th className="hidden font-medium @min-[56rem]:table-cell">Org unit</th>
                {extraColumns.map((c) => (
                  <th key={c.header} className={cx("font-medium", c.className)}>
                    {c.header}
                  </th>
                ))}
                <th className="pr-4 font-medium">Status</th>
                {rowAction && <th className="w-px pr-3" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const on = checked(u.id);
                return (
                  <tr
                    key={u.id}
                    onClick={selectable ? () => setMany([u.id], !on) : undefined}
                    className={cx(
                      "transition-colors",
                      selectable && "cursor-pointer",
                      on ? "bg-brio-primary/10" : "hover:bg-brio-hover",
                    )}
                  >
                    {selectable && (
                      <td className="pl-4">
                        <Checkbox
                          label={"Select " + fullName(u)}
                          checked={on}
                          onChange={() => setMany([u.id], !on)}
                        />
                      </td>
                    )}
                    <td className="pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={fullName(u)} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-brio-ink [overflow-wrap:anywhere]">
                            {fullName(u)}
                          </p>
                          <p className="text-xs text-brio-muted [overflow-wrap:anywhere]">
                            {u.email}
                          </p>
                          <p className="mt-0.5 text-xs text-brio-muted @min-[38rem]:hidden">
                            {u.title} · {u.department}
                          </p>
                          {!selectable && u.orgUnit && (
                            <p className="mt-1 text-xs text-brio-muted @min-[56rem]:hidden">
                              {u.orgUnit}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden pr-4 text-slate-600 @min-[38rem]:table-cell">
                      {u.title}
                    </td>
                    <td className="hidden pr-4 text-slate-600 @min-[38rem]:table-cell">
                      {u.department}
                    </td>
                    <td className="hidden pr-4 font-mono text-xs text-brio-muted @min-[56rem]:table-cell">
                      {u.orgUnit}
                    </td>
                    {extraColumns.map((c) => (
                      <td key={c.header} className={cx("pr-4", c.className)}>
                        {c.render(u)}
                      </td>
                    ))}
                    <td className="pr-4">
                      {u.status === "active" ? (
                        <Badge tone="green" dot>
                          Active
                        </Badge>
                      ) : (
                        <Badge tone="amber" dot>
                          Suspended
                        </Badge>
                      )}
                    </td>
                    {rowAction && (
                      <td className="pr-3" onClick={(e) => e.stopPropagation()}>
                        {rowAction(u)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<Users className="size-5" />}
          title={users.length ? "No matching users" : "Directory unavailable"}
          description={
            users.length
              ? "Try another search or clear the filters."
              : "No users are available for this customer."
          }
        />
      )}
      <TablePagination
        label="Directory pagination"
        noun="user"
        total={filtered.length}
        page={currentPage + 1}
        pageSize={PAGE}
        onPageChange={(p) => setPage(p - 1)}
      />
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="capitalize">
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    </Field>
  );
}
