import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  PenLine,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { DEMO_AGENT } from "../data";
import { useStore } from "../store";
import { Button, Field, Input } from "../components/ui";

export function LoginPage() {
  const { login } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    if (email.trim().toLowerCase() !== DEMO_AGENT.email || password !== DEMO_AGENT.password)
      return setError("Incorrect email or password.");
    login({ name: DEMO_AGENT.name, email: DEMO_AGENT.email });
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="relative hidden overflow-hidden bg-slate-950 p-5 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(58,92,240,0.35),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(124,58,237,0.25),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="relative flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-white text-slate-950">
            <ShieldCheck className="size-4.5" strokeWidth={2.2} />
          </span>
          <span className="font-semibold tracking-tight">Workspace Ops</span>
        </div>
        <div className="relative mt-auto max-w-md">
          <h1 className="text-[38px] leading-[1.1] font-semibold tracking-tight">
            Manage every customer's Google Workspace from one place.
          </h1>
          <p className="mt-4 text-[15px] text-slate-400">
            Deploy signatures, manage mailbox delegates, and track every batch for each customer.
          </p>
          <ul className="mt-10 flex flex-col gap-4 text-sm text-slate-300">
            {[
              [
                <PenLine key="p" />,
                "Signature templates for a single user, a group, or a whole directory",
              ],
              [<UserCog key="u" />, "Delegate access for primary customer mailboxes"],
              [<KeyRound key="k" />, "Works through each customer's service account"],
            ].map(([icon, text], i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 [&_svg]:size-4">
                  {icon}
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-center bg-white p-5">
        <form onSubmit={submit} className="w-full max-w-sm" noValidate>
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-8 place-items-center rounded-lg bg-slate-950 text-white">
              <ShieldCheck className="size-4" strokeWidth={2.2} />
            </span>
            <span className="text-sm font-semibold tracking-tight">Workspace Ops</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Agent sign in</h2>
          <p className="mt-1.5 text-sm text-slate-500">Use your Workspace Ops agent credentials.</p>
          <div className="mt-8 flex flex-col gap-4">
            <Field label="Work email">
              <Input
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@workspaceops.io"
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-[13px] text-rose-700">{error}</p>
            )}
            <Button type="submit" variant="primary" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {busy ? "Signing in…" : "Sign in"}
              {!busy && <ArrowRight className="size-4" />}
            </Button>
          </div>
          <div className="mt-8 rounded-xl bg-slate-50 p-4 text-[13px] ring-1 ring-slate-200/70">
            <p className="font-medium text-slate-800">Demo credentials</p>
            <p className="mt-1 font-mono text-xs leading-5 break-words text-slate-600">
              {DEMO_AGENT.email} · {DEMO_AGENT.password}
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_AGENT.email);
                setPassword(DEMO_AGENT.password);
                setError("");
              }}
              className="mt-2 text-xs font-medium text-accent-700 hover:underline"
            >
              Fill in demo credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
