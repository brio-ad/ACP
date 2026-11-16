import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildSeed,
  customerDirectory,
  withDemoCustomers,
  uid,
  type Agent,
  type Assignment,
  type Customer,
  type Delegation,
  type LogEntry,
  type Seed,
  type Template,
} from "./data";

export type CustomerTab = "directory" | "signatures" | "delegates" | "history";

export type Route =
  | { name: "customers" }
  | { name: "customer"; id: string; tab?: CustomerTab; logId?: string }
  | { name: "template"; customerId: string; templateId: string }
  | { name: "assign"; customerId: string; templateId?: string };

interface Toast {
  id: number;
  message: string;
  tone: "success" | "info" | "error";
}

export interface BatchCommit {
  assignments?: Record<string, Assignment>;
  addDelegations?: Delegation[];
  removeDelegationIds?: string[];
}

interface Store {
  agent: Agent | null;
  data: Seed;
  route: Route;
  navigate: (r: Route, options?: { preserveScroll?: boolean }) => void;
  login: (agent: Agent) => void;
  logout: () => void;
  saveTemplate: (t: Template) => void;
  deleteTemplate: (id: string) => void;
  commitBatch: (log: LogEntry, changes: BatchCommit) => void;
  toasts: Toast[];
  toast: (message: string, tone?: Toast["tone"]) => void;
  resetDemo: () => void;
}

const KEY = "gws-agent-portal-v2";
const Ctx = createContext<Store | null>(null);

function load(): { agent: Agent | null; data: Seed | null } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt storage */
  }
  return { agent: null, data: null };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(load, []);
  const [agent, setAgent] = useState<Agent | null>(initial.agent);
  const [data, setData] = useState<Seed>(() =>
    initial.data ? withDemoCustomers(initial.data) : buildSeed("agent@workspaceops.io"),
  );
  const [route, setRoute] = useState<Route>({ name: "customers" });
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ agent, data }));
  }, [agent, data]);

  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const navigate = useCallback((r: Route, options?: { preserveScroll?: boolean }) => {
    setRoute(r);
    if (!options?.preserveScroll) document.getElementById("main-scroll")?.scrollTo({ top: 0 });
  }, []);

  const login = useCallback((a: Agent) => {
    setAgent(a);
    setRoute({ name: "customers" });
  }, []);
  const logout = useCallback(() => setAgent(null), []);

  const templateActivity = useCallback(
    (
      t: Template,
      action: "template-created" | "template-updated" | "template-deleted",
    ): LogEntry => ({
      id: uid("log"),
      customerId: t.customerId,
      kind: "signature",
      action,
      name: t.name || "Untitled template",
      detail: "",
      templateId: t.id,
      trigger: "manual",
      triggeredBy: agent?.email ?? "agent",
      startedAt: new Date().toISOString(),
      durationMs: 0,
      results: [],
    }),
    [agent],
  );

  const saveTemplate = useCallback(
    (t: Template) => {
      setData((d) => {
        const editing = d.templates.some((x) => x.id === t.id && x.customerId === t.customerId);
        const entry = templateActivity(t, editing ? "template-updated" : "template-created");
        const next = { ...t, updatedAt: entry.startedAt };
        return {
          ...d,
          templates: editing
            ? d.templates.map((x) => (x.id === t.id && x.customerId === t.customerId ? next : x))
            : [next, ...d.templates],
          logs: [entry, ...d.logs],
        };
      });
    },
    [templateActivity],
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      setData((d) => {
        const t = d.templates.find((x) => x.id === id);
        if (!t) return d;
        return {
          ...d,
          templates: d.templates.filter((x) => x.id !== id),
          logs: [templateActivity(t, "template-deleted"), ...d.logs],
        };
      });
    },
    [templateActivity],
  );

  const commitBatch = useCallback((log: LogEntry, ch: BatchCommit) => {
    setData((d) => {
      const remove = new Set(ch.removeDelegationIds ?? []);
      return {
        ...d,
        logs: [log, ...d.logs],
        assignments: ch.assignments
          ? {
              ...d.assignments,
              [log.customerId]: { ...d.assignments[log.customerId], ...ch.assignments },
            }
          : d.assignments,
        delegations: [
          ...d.delegations.filter((x) => !remove.has(x.id)),
          ...(ch.addDelegations ?? []),
        ],
      };
    });
  }, []);

  const resetDemo = useCallback(() => {
    setData(buildSeed(agent?.email ?? "agent@workspaceops.io"));
    setRoute({ name: "customers" });
  }, [agent]);

  const value = useMemo<Store>(
    () => ({
      agent,
      data,
      route,
      navigate,
      login,
      logout,
      saveTemplate,
      deleteTemplate,
      commitBatch,
      toasts,
      toast,
      resetDemo,
    }),
    [
      agent,
      data,
      route,
      navigate,
      login,
      logout,
      saveTemplate,
      deleteTemplate,
      commitBatch,
      toasts,
      toast,
      resetDemo,
    ],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

/** Everything scoped to one customer. */
export function useCustomer(id: string) {
  const { data } = useStore();
  const customer = data.customers.find((c) => c.id === id);
  const stored = data.users[id];
  const users = useMemo(
    () => (customer ? customerDirectory(customer, stored) : []),
    [customer, stored],
  );
  return useMemo(() => {
    return {
      customer,
      users,
      templates: data.templates.filter((t) => t.customerId === id),
      logs: data.logs.filter((l) => l.customerId === id),
      assignments: data.assignments[id] ?? {},
      delegations: data.delegations.filter((x) => x.customerId === id),
    };
  }, [data, id, customer, users]);
}

export type CustomerScope = Omit<ReturnType<typeof useCustomer>, "customer"> & {
  customer: Customer;
};
