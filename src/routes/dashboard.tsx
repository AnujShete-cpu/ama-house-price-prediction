import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  BarChart3,
  Coins,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { useAppStore, useSessionUser } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn, formatINR } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

type View = "all" | "mine";

function DashboardPage() {
  const predictions = useAppStore((s) => s.predictions);
  const deletePrediction = useAppStore((s) => s.deletePrediction);
  const logout = useAppStore((s) => s.logout);
  const user = useSessionUser();
  const hydrated = useHydrated();
  const [view, setView] = useState<View>("all");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const mineId = user?.id ?? "guest";
  const visible = useMemo(() => {
    if (view === "mine") return predictions.filter((p) => p.source === "user" && p.userId === mineId);
    return predictions;
  }, [predictions, view, mineId]);

  const stats = useMemo(() => {
    if (visible.length === 0) {
      return { total: 0, avg: 0, high: 0, low: 0 };
    }
    const prices = visible.map((p) => p.price);
    const total = prices.length;
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / total);
    return { total, avg, high: Math.max(...prices), low: Math.min(...prices) };
  }, [visible]);

  const buckets = useMemo(() => {
    const defs = [
      { key: "20-40", min: 20, max: 40 },
      { key: "40-60", min: 40, max: 60 },
      { key: "60-80", min: 60, max: 80 },
      { key: "80-100", min: 80, max: 100 },
      { key: "100+", min: 100, max: Infinity },
    ];
    return defs.map((d) => ({
      range: d.key,
      count: visible.filter((p) => {
        const lakhs = p.price / 100_000;
        return lakhs >= d.min && lakhs < d.max;
      }).length,
    }));
  }, [visible]);

  const recent = visible.slice(0, 8);

  return (
    <div className="page-enter mx-auto flex max-w-6xl gap-0 px-0 md:px-6 md:py-8">
      <aside className="no-print hidden w-56 shrink-0 flex-col rounded-2xl bg-navy p-3 text-navy-fg md:flex">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active />
        <NavItem to="/predict" icon={Sparkles} label="Predict" />
        <button
          type="button"
          onClick={() => setView("mine")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/8",
            view === "mine" ? "bg-primary text-white" : "text-white/80",
          )}
        >
          <BarChart3 className="size-4" />
          My Predictions
        </button>
        <NavItem to="/about" icon={Info} label="About" />
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/8"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </aside>

      <div className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-0">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-2 md:hidden">
            <Button size="sm" variant={view === "all" ? "primary" : "outline"} onClick={() => setView("all")}>
              All
            </Button>
            <Button size="sm" variant={view === "mine" ? "primary" : "outline"} onClick={() => setView("mine")}>
              Mine
            </Button>
          </div>
        </div>

        {!hydrated ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Predictions" value={String(stats.total)} icon={Home} />
              <StatCard label="Average Price" value={formatINR(stats.avg)} icon={Coins} />
              <StatCard label="Highest Price" value={formatINR(stats.high)} icon={Home} accent="up" />
              <StatCard label="Lowest Price" value={formatINR(stats.low)} icon={ArrowDownRight} accent="down" />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-2xl bg-card p-4 shadow-[var(--shadow-card)] md:p-5">
                <h2 className="mb-3 font-display text-base font-semibold">Price Range (in Lakhs)</h2>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buckets} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}>
                      <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="currentColor" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" />
                      <Tooltip
                        cursor={{ fill: "color-mix(in oklab, var(--surface-primary) 12%, transparent)" }}
                        contentStyle={{
                          background: "var(--surface-card)",
                          border: "none",
                          borderRadius: 12,
                          boxShadow: "var(--elev-card)",
                        }}
                      />
                      <Bar dataKey="count" fill="var(--surface-primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-1 text-center text-xs text-subtle">Number of Predictions</p>
              </section>

              <section className="rounded-2xl bg-card p-4 shadow-[var(--shadow-card)] md:p-5">
                <h2 className="mb-3 font-display text-base font-semibold">Recent Predictions</h2>
                {recent.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <p className="text-sm text-muted">No predictions in this view yet.</p>
                    <Link to="/predict" className="mt-3">
                      <Button size="sm">Run a prediction</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[20rem] text-left text-sm">
                      <thead className="text-xs tracking-wide text-muted uppercase">
                        <tr className="border-b border-border">
                          <th className="py-2 font-medium">Location</th>
                          <th className="py-2 font-medium">Area (sq.ft.)</th>
                          <th className="py-2 font-medium">Price</th>
                          <th className="py-2 no-print" />
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map((row) => (
                          <tr key={row.id} className="border-b border-border/70 last:border-0 hover:bg-fg/3">
                            <td className="py-2.5">{row.input.city}</td>
                            <td className="py-2.5 tabular-nums">{row.input.area}</td>
                            <td className="py-2.5 font-medium tabular-nums">{formatINR(row.price)}</td>
                            <td className="py-2.5 text-right no-print">
                              {row.source === "user" ? (
                                <button
                                  type="button"
                                  className="text-xs font-medium text-danger hover:underline"
                                  onClick={() => setPendingDelete(row.id)}
                                >
                                  Delete
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out?"
        description="You can keep using the estimator as a guest."
        confirmLabel="Log out"
        danger
        onConfirm={logout}
      />
      <ConfirmModal
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this prediction?"
        description="This removes it from your local history. Market samples stay."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (pendingDelete) deletePrediction(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: "/predict" | "/about" | "/dashboard";
  icon: typeof Home;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/8",
        active ? "bg-primary text-white" : "text-white/80",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Home;
  accent?: "up" | "down";
}) {
  return (
    <article className="rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="font-display text-xl font-bold tabular-nums">{value}</p>
        <span
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-lg",
            accent === "down" ? "bg-danger-soft text-danger" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
    </article>
  );
}
