import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/login")({ component: LoginPage });

type Mode = "login" | "register";

function LoginPage() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (mode === "register" && name.trim().length < 2) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validate()) {
      setError("Please correct the highlighted fields.");
      return;
    }
    setBusy(true);
    const result =
      mode === "login"
        ? await login({ email, password })
        : await register({ name, email, password });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(mode === "login" ? "Welcome back. Redirecting…" : "Account created. Redirecting…");
    window.setTimeout(() => {
      void navigate({ to: "/dashboard" });
    }, 700);
  }

  return (
    <div className="page-enter mx-auto grid max-w-5xl items-center gap-10 px-4 py-10 md:grid-cols-[1fr_16rem] md:px-6">
      <section className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        <h1 className="font-display text-2xl font-bold">
          {mode === "login" ? "Login" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "login"
            ? "Sign in to tag predictions to your name on this device."
            : "Register locally — your password never leaves this browser."}
        </p>

        <div className="mt-5 grid grid-cols-2 rounded-lg bg-bg p-1">
          <button
            type="button"
            className={`h-10 rounded-md text-sm font-semibold ${mode === "login" ? "bg-card text-fg shadow-[var(--shadow-card)]" : "text-muted"}`}
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`h-10 rounded-md text-sm font-semibold ${mode === "register" ? "bg-card text-fg shadow-[var(--shadow-card)]" : "text-muted"}`}
            onClick={() => {
              setMode("register");
              setError(null);
              setSuccess(null);
            }}
          >
            Register
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p
            className="mt-4 flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm text-success-fg"
            role="status"
          >
            <CheckCircle2 className="size-4" />
            {success}
          </p>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
          {mode === "register" ? (
            <Field label="Name" htmlFor="name" error={fieldErrors.name}>
              <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
          ) : null}
          <Field label="Email" htmlFor="email" error={fieldErrors.email}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password" htmlFor="password" error={fieldErrors.password}>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12"
              />
              <button
                type="button"
                className="absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-fg"
                aria-label={showPw ? "Hide password" : "Show password"}
                onClick={() => setShowPw((v) => !v)}
              >
                <span className="relative size-4">
                  <Eye
                    className={`absolute inset-0 size-4 transition-[opacity,transform,filter] duration-300 ${showPw ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-0"}`}
                  />
                  <EyeOff
                    className={`absolute inset-0 size-4 transition-[opacity,transform,filter] duration-300 ${showPw ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]"}`}
                  />
                </span>
              </button>
            </div>
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
          </Button>
        </form>
      </section>

      <aside className="hidden text-center md:block">
        <img src="/images/iso-house.jpg" alt="" className="mx-auto w-52 rounded-2xl" />
        <p className="mt-4 text-sm text-muted">Save your estimates and open them from the dashboard.</p>
      </aside>
    </div>
  );
}
