import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  ArrowUp,
  BarChart3,
  CheckCircle2,
  Home,
  Info,
  LoaderCircle,
  Mail,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ConfirmModal, Modal } from "@/components/ui/modal";
import { SEARCH_INDEX, searchSite } from "@/lib/search-index";
import { useAppStore, useSessionUser } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { APP_NAME, LAST_UPDATED, cn } from "@/lib/utils";
import { captureUtmFromLocation, formatUtm, readUtm, type UtmParams } from "@/lib/utm";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/predict", label: "Predict" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
] as const;

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-lg",
          light ? "bg-white/12 text-navy-fg" : "bg-primary/12 text-primary",
        )}
      >
        <Home className="size-5" strokeWidth={2.2} />
      </span>
      <span
        className={cn(
          "font-display text-[0.95rem] font-bold tracking-tight sm:text-base",
          light ? "text-navy-fg" : "text-fg",
        )}
      >
        {APP_NAME}
      </span>
    </Link>
  );
}

export function SkipLink() {
  return (
    <a href="#content" className="skip-link no-print">
      Skip to content
    </a>
  );
}

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="no-print pointer-events-none fixed top-0 right-0 left-0 z-50 h-[3px] bg-transparent"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label="Scroll progress"
    >
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function PromoBanner() {
  const dismissed = useAppStore((s) => s.bannerDismissed);
  const dismiss = useAppStore((s) => s.dismissBanner);
  const hydrated = useHydrated();
  if (!hydrated || dismissed) return null;
  return (
    <div className="no-print bg-banner text-banner-fg">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-sm md:px-6">
        <p className="min-w-0 flex-1">
          Estimates for 10 Indian cities — enter details and get a price in seconds.
        </p>
        <button
          onClick={dismiss}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-white/10"
          aria-label="Dismiss banner"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

function ThemeToggle({ light = false }: { light?: boolean }) {
  const theme = useAppStore((s) => s.theme);
  const toggle = useAppStore((s) => s.toggleTheme);
  const hydrated = useHydrated();
  const dark = hydrated && theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-lg transition-colors duration-150",
        light ? "text-navy-fg hover:bg-white/10" : "text-fg hover:bg-fg/6",
      )}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="relative size-5">
        <Sun
          className={cn(
            "absolute inset-0 size-5 transition-[opacity,transform,filter] duration-300",
            dark ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-0",
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 size-5 transition-[opacity,transform,filter] duration-300",
            dark ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]",
          )}
        />
      </span>
    </button>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useSessionUser();
  const hydrated = useHydrated();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="no-print sticky top-0 z-40 bg-navy text-navy-fg">
      <div className="mx-auto flex h-[var(--header-h)] max-w-6xl items-center gap-3 px-4 md:px-6">
        <BrandMark light />
        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                  active ? "text-white" : "text-white/70 hover:text-white",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary transition-opacity duration-150",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex size-11 items-center justify-center rounded-lg text-navy-fg hover:bg-white/10"
            aria-label="Search the site"
          >
            <Search className="size-5" />
          </button>
          <ThemeToggle light />
          {hydrated && user ? (
            <Button
              variant="primary"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => setLogoutOpen(true)}
            >
              Logout
            </Button>
          ) : (
            <Link to="/login" className="hidden md:inline-flex">
              <Button variant="primary" size="sm">
                Login
              </Button>
            </Link>
          )}
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg text-navy-fg hover:bg-white/10 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <div className="border-t border-white/10 bg-navy-mid md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-3 py-3" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-lg px-3 py-3 text-base font-medium",
                  pathname === item.to ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/8",
                )}
              >
                {item.label}
              </Link>
            ))}
            {hydrated && user ? (
              <button
                className="rounded-lg px-3 py-3 text-left text-base font-medium text-white/80 hover:bg-white/8"
                onClick={() => setLogoutOpen(true)}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="rounded-lg px-3 py-3 text-base font-medium text-white/80 hover:bg-white/8">
                Login
              </Link>
            )}
          </nav>
        </div>
      ) : null}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <ConfirmModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out?"
        description="You can still predict prices as a guest. Saved history stays on this device."
        confirmLabel="Log out"
        danger
        onConfirm={logout}
      />
    </header>
  );
}

function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const hits = useMemo(() => searchSite(q), [q]);

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Jump to a page, city, or help topic."
    >
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search pages, cities, FAQ…"
          className="pl-9"
          aria-label="Site search"
        />
      </div>
      <ul className="mt-3 max-h-72 overflow-auto">
        {hits.length === 0 ? (
          <li className="px-2 py-6 text-center text-sm text-muted">No matches for “{q}”.</li>
        ) : (
          hits.map((hit) => (
            <li key={hit.id}>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-fg/5"
                onClick={() => {
                  onOpenChange(false);
                  router.history.push(hit.href);
                }}
              >
                <span>
                  <span className="block text-sm font-medium">{hit.title}</span>
                  <span className="block text-xs text-muted">{hit.hint}</span>
                </span>
                <span className="mt-0.5 text-[11px] font-medium tracking-wide text-subtle uppercase">
                  {hit.group}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
      {!q ? (
        <p className="mt-2 text-xs text-subtle">{SEARCH_INDEX.length} indexed items</p>
      ) : null}
    </Modal>
  );
}

export function SiteFooter() {
  const [utm, setUtm] = useState<UtmParams | null>(null);
  useEffect(() => {
    setUtm(readUtm());
  }, []);
  const campaign = formatUtm(utm);

  return (
    <footer className="no-print border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-center text-sm text-muted md:px-6">
        <p className="flex items-center justify-center gap-1.5">
          © 2026 {APP_NAME}
          <span aria-hidden="true">|</span>
          Made with
          <Home className="size-3.5 text-danger" aria-hidden="true" />
          using Machine Learning
        </p>
        <p>Last updated {LAST_UPDATED}</p>
        {campaign ? (
          <p className="text-xs text-subtle">
            Campaign: <span className="font-medium text-muted">{campaign}</span>
          </p>
        ) : null}
      </div>
    </footer>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      className="no-print fixed right-5 bottom-24 z-30 inline-flex size-12 items-center justify-center rounded-full bg-navy text-navy-fg shadow-[var(--shadow-card)] transition-[transform,background-color] duration-150 hover:bg-navy-mid"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const addMessage = useAppStore((s) => s.addMessage);

  function validate() {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email.";
    if (message.trim().length < 10) next.message = "Message should be at least 10 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit() {
    if (!validate()) {
      setStatus("error");
      return;
    }
    addMessage({ name, email, message });
    setStatus("success");
    setName("");
    setEmail("");
    setMessage("");
    setErrors({});
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStatus("idle");
          setOpen(true);
        }}
        className="no-print fixed right-5 bottom-6 z-30 inline-flex size-12 items-center justify-center rounded-full bg-primary text-primary-fg shadow-[var(--shadow-card)] transition-[transform,background-color] duration-150 hover:bg-primary-dark"
        aria-label="Contact us"
      >
        <Mail className="size-5" />
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Contact the team"
        description="Questions about a listing or the model? Send a note — we store it on this device for the demo."
      >
        {status === "success" ? (
          <div className="rounded-xl bg-success-soft px-4 py-5 text-center">
            <CheckCircle2 className="mx-auto mb-2 size-8 text-success" />
            <p className="font-display font-semibold text-success-fg">Message sent</p>
            <p className="mt-1 text-sm text-muted">Thanks — we’ll get back to you shortly.</p>
            <Button className="mt-4" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (validate()) setConfirmOpen(true);
              else setStatus("error");
            }}
          >
            {status === "error" ? (
              <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                Please fix the highlighted fields and try again.
              </p>
            ) : null}
            <Field label="Name" htmlFor="contact-name" error={errors.name}>
              <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email" htmlFor="contact-email" error={errors.email}>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Message" htmlFor="contact-message" error={errors.message}>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send message</Button>
            </div>
          </form>
        )}
      </Modal>
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Send this message?"
        description="We’ll keep a copy locally so you can demo the success state."
        confirmLabel="Send"
        onConfirm={submit}
      />
    </>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    captureUtmFromLocation();
    const theme = useAppStore.getState().theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  return (
    <div className="flex min-h-svh flex-col bg-bg text-fg">
      <SkipLink />
      <ScrollProgress />
      <PromoBanner />
      <SiteHeader />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <BackToTop />
      <FloatingContact />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <LoaderCircle className="size-8 animate-spin text-primary" />
    </div>
  );
}

export function FeatureIcon({ name }: { name: "chart" | "bolt" | "shield" }) {
  const Icon = name === "chart" ? BarChart3 : name === "bolt" ? Info : CheckCircle2;
  return (
    <span className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-navy-fg">
      <Icon className="size-5" />
    </span>
  );
}
