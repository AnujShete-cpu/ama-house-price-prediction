import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Copy, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/site-chrome";
import { useAppStore } from "@/lib/store";
import { useStoreReady } from "@/lib/use-hydrated";
import { formatINR, formatLakhs } from "@/lib/utils";

export const Route = createFileRoute("/result")({ component: ResultPage });

function ResultPage() {
  const last = useAppStore((s) => s.lastResult);
  const navigate = useNavigate();
  const ready = useStoreReady();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ready && !last) void navigate({ to: "/predict" });
  }, [last, navigate, ready]);

  if (!ready) return <PageLoader />;
  if (!last) return null;
  const { input, price } = last;

  function copyPrice() {
    const text = formatINR(price);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
    void (async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          return;
        }
      } catch {
        /* fall through to execCommand */
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    })();
  }

  const rows = [
    ["Location / Area", input.city],
    ["Area (sq.ft.)", String(input.area)],
    ["Bedrooms", String(input.bedrooms)],
    ["Bathrooms", String(input.bathrooms)],
    ["Floors", String(input.floors)],
    ["Parking", input.parking],
    ["Property Type", input.propertyType],
    ["House Age", `${input.age} years`],
    ["Furnished", input.furnished],
  ];

  return (
    <div className="page-enter mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <div className="print-only mb-6">
        <h1 className="font-display text-xl font-bold">House Price Prediction — Estimate</h1>
        <p className="text-sm">Printed from the live estimator</p>
      </div>

      <section className="rounded-2xl bg-success-soft px-5 py-10 text-center md:px-8">
        <div className="mx-auto flex max-w-lg flex-col items-center">
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-success-fg">
            <CheckCircle2 className="size-5" />
            Predicted House Price
          </p>
          <p className="mt-3 font-display text-4xl font-extrabold tracking-tight text-success tabular-nums sm:text-5xl">
            {formatINR(price)}
          </p>
          <p className="mt-1 text-muted">({formatLakhs(price)})</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 no-print">
            <Button variant="outline" size="sm" onClick={copyPrice}>
              <Copy className="size-3.5" />
              {copied ? "Copied" : "Copy price"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-3.5" />
              Print
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Model confidence {last.confidence}% · {formatINR(last.ppsf)} per sq.ft.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] md:p-6">
        <h2 className="mb-4 font-display text-base font-semibold">Your Input Details</h2>
        <dl className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[10.5rem_1fr] items-baseline gap-2 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="flex gap-2 font-medium">
                <span className="text-subtle">:</span>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-6 flex flex-wrap justify-center gap-3 no-print">
        <Link to="/predict">
          <Button size="lg">Predict Again</Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
