import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ConfirmModal } from "@/components/ui/modal";
import {
  BATHROOMS,
  BEDROOMS,
  CITIES,
  DEFAULT_INPUT,
  FLOORS,
  FURNISHED,
  PARKING,
  PROPERTY_TYPES,
  predictPrice,
  type City,
  type Furnished,
  type HouseInput,
  type PropertyType,
} from "@/lib/model";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Search = { city?: string };

export const Route = createFileRoute("/predict")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    city: typeof search.city === "string" ? search.city : undefined,
  }),
  component: PredictPage,
});

type Errors = Partial<Record<keyof HouseInput, string>>;

function PredictPage() {
  const { city: cityFromSearch } = Route.useSearch();
  const navigate = useNavigate();
  const savePrediction = useAppStore((s) => s.savePrediction);
  const [form, setForm] = useState<HouseInput>(DEFAULT_INPUT);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (!cityFromSearch) return;
    const match = CITIES.find(
      (c) => c.toLowerCase() === decodeURIComponent(cityFromSearch).toLowerCase(),
    );
    if (match) setForm((f) => ({ ...f, city: match }));
  }, [cityFromSearch]);

  function update<K extends keyof HouseInput>(key: K, value: HouseInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
    setFormError(null);
  }

  function validate(next: HouseInput): Errors {
    const e: Errors = {};
    if (!CITIES.includes(next.city)) e.city = "Choose a location.";
    if (!Number.isFinite(next.area) || next.area < 200) e.area = "Area must be at least 200 sq.ft.";
    if (next.area > 10000) e.area = "Area cannot exceed 10,000 sq.ft.";
    if (next.bedrooms < 1 || next.bedrooms > 5) e.bedrooms = "Choose bedrooms.";
    if (next.bathrooms < 1 || next.bathrooms > 4) e.bathrooms = "Choose bathrooms.";
    if (next.floors < 1 || next.floors > 4) e.floors = "Choose floors.";
    if (!Number.isFinite(next.age) || next.age < 0) e.age = "Age cannot be negative.";
    if (next.age > 80) e.age = "Age cannot exceed 80 years.";
    return e;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setFormError("Please correct the highlighted fields.");
      return;
    }
    setFormError(null);
    setLoading(true);
    setProgress(8);
    const started = performance.now();
    const tick = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - started) / 1400);
      setProgress(8 + t * 90);
    }, 40);
    await new Promise((r) => setTimeout(r, 1500));
    window.clearInterval(tick);
    const result = predictPrice(form);
    savePrediction(form, result);
    setProgress(100);
    await new Promise((r) => setTimeout(r, 180));
    void navigate({ to: "/result" });
  }

  return (
    <div className="page-enter mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] md:p-7">
          <div className="mb-6 flex items-start gap-3">
            <span className="mt-0.5 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 11.5 12 5l8 6.5V20H4v-8.5Z" />
                <path d="M9 20v-6h6v6" />
              </svg>
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold">Enter House Details</h1>
              <p className="mt-1 text-sm text-muted">
                Fill in the details below to predict the price of a house.
              </p>
            </div>
          </div>

          {formError ? (
            <p className="mb-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{formError}</p>
          ) : null}

          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
            <Field label="Location / Area" htmlFor="city" error={errors.city}>
              <Select
                id="city"
                value={form.city}
                onChange={(e) => update("city", e.target.value as City)}
              >
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Area (sq.ft.)" htmlFor="area" error={errors.area}>
              <Input
                id="area"
                inputMode="numeric"
                value={form.area}
                onChange={(e) => update("area", Number(e.target.value))}
              />
            </Field>
            <Field label="Bedrooms" htmlFor="bedrooms" error={errors.bedrooms}>
              <Select
                id="bedrooms"
                value={String(form.bedrooms)}
                onChange={(e) => update("bedrooms", Number(e.target.value))}
              >
                {BEDROOMS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </Select>
            </Field>
            <Field label="Bathrooms" htmlFor="bathrooms" error={errors.bathrooms}>
              <Select
                id="bathrooms"
                value={String(form.bathrooms)}
                onChange={(e) => update("bathrooms", Number(e.target.value))}
              >
                {BATHROOMS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </Select>
            </Field>
            <Field label="Floors" htmlFor="floors" error={errors.floors}>
              <Select
                id="floors"
                value={String(form.floors)}
                onChange={(e) => update("floors", Number(e.target.value))}
              >
                {FLOORS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </Select>
            </Field>
            <Field label="Parking" htmlFor="parking" error={errors.parking}>
              <Select
                id="parking"
                value={form.parking}
                onChange={(e) => update("parking", e.target.value as "Yes" | "No")}
              >
                {PARKING.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </Select>
            </Field>
            <Field label="Property Type" htmlFor="propertyType" error={errors.propertyType}>
              <Select
                id="propertyType"
                value={form.propertyType}
                onChange={(e) => update("propertyType", e.target.value as PropertyType)}
              >
                {PROPERTY_TYPES.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </Select>
            </Field>
            <Field label="House Age (years)" htmlFor="age" error={errors.age}>
              <Input
                id="age"
                inputMode="numeric"
                value={form.age}
                onChange={(e) => update("age", Number(e.target.value))}
              />
            </Field>
            <Field label="Furnished" htmlFor="furnished" error={errors.furnished}>
              <Select
                id="furnished"
                value={form.furnished}
                onChange={(e) => update("furnished", e.target.value as Furnished)}
              >
                {FURNISHED.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </Select>
            </Field>
            <div className="flex items-end justify-end">
              <button
                type="button"
                className="mb-2 text-sm font-medium text-muted hover:text-fg"
                onClick={() => setResetOpen(true)}
              >
                Reset form
              </button>
            </div>
            <div className="sm:col-span-2 pt-2">
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Running model…" : "Predict Price"}
              </Button>
            </div>
          </form>
        </section>

        <aside className="flex flex-col items-center text-center lg:pt-6">
          <img
            src="/images/iso-house.jpg"
            alt="Illustrated suburban house"
            className="w-56 max-w-full rounded-2xl"
          />
          <p className="mt-4 max-w-[14rem] text-sm leading-relaxed text-muted">
            Enter the details and get the estimated price instantly!
          </p>
        </aside>
      </div>

      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/45 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-[var(--shadow-card)]">
            <p className="font-display text-lg font-semibold">Analyzing features</p>
            <p className="mt-1 text-sm text-muted">Linear model + forest interactions</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-fg/8">
              <div
                className={cn("h-full rounded-full bg-primary transition-[width] duration-150")}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset the form?"
        description="This restores the default Pune apartment example."
        confirmLabel="Reset"
        danger
        onConfirm={() => {
          setForm(DEFAULT_INPUT);
          setErrors({});
          setFormError(null);
        }}
      />
    </div>
  );
}
