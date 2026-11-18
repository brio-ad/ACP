import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Headset, Loader2 } from "lucide-react";
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
    <div className="grid min-h-dvh bg-brio-surface lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]">
      <aside className="relative isolate hidden min-w-0 flex-col overflow-hidden bg-brio-brand-canvas p-10 lg:flex">
        <img
          src="/login-abstract.jpg"
          alt=""
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="self-start rounded-brio-panel bg-brio-surface p-3">
          <img src="/brio-logo.png" alt="Brio" className="h-10 w-auto" />
        </div>
        <a
          href="https://support.briotech.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex min-h-10 items-center gap-2 self-start rounded-brio-control bg-brio-surface px-3 py-2 text-sm font-medium text-brio-ink underline underline-offset-4 hover:bg-brio-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brio-focus"
        >
          <Headset className="size-5" aria-hidden />
          Contact Support
        </a>
      </aside>
      <main className="flex min-w-0 flex-col bg-brio-surface p-5 sm:p-10">
        <div className="mb-10 flex items-center justify-between gap-4 lg:hidden">
          <img src="/brio-logo.png" alt="Brio" className="h-8 w-auto" />
          <span className="text-sm text-brio-muted">Brio ACP</span>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <form onSubmit={submit} className="w-full max-w-sm" noValidate>
            <h2 className="text-center text-2xl font-medium tracking-tight text-brio-ink">
              Agent sign in
            </h2>
            <p className="mt-2 text-center text-sm text-brio-muted">
              Use your Brio ACP agent credentials.
            </p>
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
                    className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-brio-control text-brio-muted hover:text-brio-ink focus-visible:outline-2 focus-visible:outline-brio-focus"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>
              {error && (
                <p
                  role="alert"
                  className="rounded-brio-control bg-brio-danger-bg px-3 py-2 text-sm text-brio-danger-ink"
                >
                  {error}
                </p>
              )}
              <Button type="submit" variant="primary" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                {busy ? "Signing in…" : "Sign in"}
                {!busy && <ArrowRight className="size-4" />}
              </Button>
            </div>
            <div className="mt-6 rounded-brio-panel bg-canvas p-4 text-sm">
              <p className="font-medium text-brio-ink">Demo credentials</p>
              <p className="mt-1 font-mono text-xs leading-5 break-words text-brio-muted">
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
      </main>
    </div>
  );
}
