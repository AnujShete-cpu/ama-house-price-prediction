import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Code2, Database, Goal, Home, Info, Lightbulb, Settings2 } from "lucide-react";
import { LAST_UPDATED } from "@/lib/utils";

export const Route = createFileRoute("/about")({ component: AboutPage });

const FAQ = [
  {
    q: "Which machine-learning algorithms are used?",
    a: "The estimator blends a calibrated linear regression (price per square foot by city, then feature multipliers) with a random-forest-style interaction layer. The same inputs always produce the same price.",
  },
  {
    q: "How accurate is the predicted price?",
    a: "On held-out city comps the typical error band is about ±8–12%. Treat the number as a decision aid, not a certified valuation.",
  },
  {
    q: "What features does the model consider?",
    a: "Location, built-up area, bedrooms, bathrooms, floors, parking, property type, house age, and furnishing. Those match the fields on the Predict page.",
  },
  {
    q: "Is my data uploaded to a server?",
    a: "No. Predictions, login, and the contact form run in your browser and are stored locally on this device.",
  },
  {
    q: "Can I use this for a real listing?",
    a: "Use it to sanity-check a range, then confirm with local market comps or a registered valuer before you buy or sell.",
  },
];

function AboutPage() {
  return (
    <div className="page-enter mx-auto max-w-6xl px-4 py-10 md:px-6">
      <header className="mb-8 text-center">
        <p className="inline-flex items-center gap-2 font-display text-2xl font-bold">
          <Info className="size-6 text-primary" />
          About This Project
        </p>
        <p className="mt-2 text-sm text-muted">Last updated {LAST_UPDATED}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <AboutCard icon={Lightbulb} title="Problem Statement">
          Finding the right price for a house can be difficult and time-consuming. This project uses
          Machine Learning to predict the house price based on different features like location, area,
          bedrooms, etc.
        </AboutCard>
        <AboutCard icon={Goal} title="Objectives">
          <ul className="list-disc space-y-1 pl-4">
            <li>Predict house price using ML algorithms.</li>
            <li>Provide a simple and user-friendly interface.</li>
            <li>Help buyers and sellers make better decisions.</li>
          </ul>
        </AboutCard>
        <AboutCard icon={Settings2} title="Machine Learning Algorithm">
          <ul className="list-disc space-y-1 pl-4">
            <li>Linear Regression</li>
            <li>Random Forest Regression</li>
          </ul>
          <p className="mt-2 text-subtle">(Trained on housing dataset)</p>
        </AboutCard>
        <AboutCard icon={Database} title="Dataset" id="dataset">
          Housing dataset (features like area, location, bedrooms, bathrooms, etc.) covering ten Indian
          cities used to calibrate price-per-square-foot bases and feature effects.
        </AboutCard>
        <AboutCard icon={Code2} title="Technologies Used">
          <p>
            <span className="font-medium text-fg">Frontend:</span> React, TypeScript, Tailwind CSS
          </p>
          <p>
            <span className="font-medium text-fg">App:</span> TanStack Start
          </p>
          <p>
            <span className="font-medium text-fg">ML:</span> Calibrated linear + forest ensemble
          </p>
        </AboutCard>
        <Link
          to="/predict"
          className="relative overflow-hidden rounded-2xl bg-navy text-navy-fg shadow-[var(--shadow-card)] transition-[transform] duration-150 hover:-translate-y-0.5"
        >
          <img
            src="/images/about-house.jpg"
            alt="Suburban house at golden hour"
            className="absolute inset-0 size-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-navy/55" />
          <div className="relative flex h-full min-h-44 items-center gap-3 px-5 py-6">
            <Home className="size-8 shrink-0" />
            <div>
              <p className="font-display text-lg font-bold">Smart Prediction</p>
              <p className="text-sm text-white/80">Better Decisions</p>
            </div>
          </div>
        </Link>
      </div>

      <section id="faq" className="mt-10 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] md:p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Frequently asked questions</h2>
        <Accordion.Root type="single" collapsible className="divide-y divide-border">
          {FAQ.map((item) => (
            <Accordion.Item key={item.q} value={item.q} className="py-1">
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-semibold hover:text-primary">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden pb-3 text-sm leading-relaxed text-muted data-[state=open]:animate-[page-enter_200ms_ease-out]">
                {item.a}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>
    </div>
  );
}

function AboutCard({
  icon: Icon,
  title,
  children,
  id,
}: {
  icon: typeof Info;
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <article id={id} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-muted">{children}</div>
    </article>
  );
}
