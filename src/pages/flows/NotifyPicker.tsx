import { useId, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { fullName, type Customer, type DirectoryUser } from "../../data";
import { Button, IconButton, Input } from "../../components/ui";

export function NotifyPicker({
  customer,
  users,
  value,
  onChange,
}: {
  customer: Customer;
  users: DirectoryUser[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const options = useMemo(() => {
    const entries = new Map<string, string>();
    for (const [email, label] of [
      [customer.contactEmail, customer.contactName + " (primary contact)"],
      ["workspace-admins@" + customer.domain, "Workspace Admins (demo group)"],
      ["leadership@" + customer.domain, "Leadership (demo group)"],
      ...users.map((user) => [user.email, fullName(user)]),
    ]) {
      if (email && !entries.has(email.toLowerCase())) entries.set(email.toLowerCase(), label);
    }
    return entries;
  }, [customer, users]);

  function add() {
    const email = query.trim().toLowerCase();
    if (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email)) {
      setError("Choose a suggestion or enter a valid email address.");
    } else if (value.some((item) => item.toLowerCase() === email)) {
      setError("This recipient is already selected.");
    } else {
      onChange([...value, email]);
      setQuery("");
      setError("");
    }
  }

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        Notification recipients{" "}
        <span className="ml-1 text-xs font-normal text-brio-muted">Optional</span>
      </label>
      <div className="flex items-start gap-2">
        <Input
          id={id}
          aria-describedby={id + "-hint"}
          aria-invalid={Boolean(error)}
          type="email"
          list={id + "-options"}
          value={query}
          placeholder="Search people or groups"
          onChange={(e) => {
            setQuery(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              e.preventDefault();
              add();
            }
          }}
        />
        <datalist id={id + "-options"}>
          {[...options]
            .filter(([email]) => !value.some((item) => item.toLowerCase() === email))
            .map(([email, label]) => (
              <option key={email} value={email} label={label} />
            ))}
        </datalist>
        <Button icon={<Plus className="size-4" />} disabled={!query.trim()} onClick={add}>
          Add
        </Button>
      </div>
      <p id={id + "-hint"} className="mt-1 text-xs text-brio-muted">
        Choose a person or demo group, or enter an email address.
      </p>
      {error && (
        <p role="alert" className="mt-1 text-xs text-brio-danger-ink">
          {error}
        </p>
      )}
      {!!value.length && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {value.map((email) => (
            <li
              key={email}
              className="inline-flex max-w-full items-center gap-1 rounded-brio-control bg-brio-hover pl-2 text-xs"
            >
              <span className="min-w-0 [overflow-wrap:anywhere]" title={email}>
                {options.get(email.toLowerCase()) ?? email}
              </span>
              <IconButton
                label={"Remove " + email}
                onClick={() => onChange(value.filter((item) => item !== email))}
              >
                <X className="size-3.5" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
