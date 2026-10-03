import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="page-enter">
      <section className="relative isolate overflow-hidden bg-navy text-navy-fg">
        <img
          src="/images/hero-house.jpg"
          alt="Modern villa at dusk with warm interior lights"
          className="absolute inset-0 size-full object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-linear-to-r from-navy via-navy/88 to-navy/35" />
        <div className="relative mx-auto grid min-h-[34rem] max-w-6xl items-center px-4 py-16 md:min-h-[38rem] md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="stagger-in max-w-xl">
            <p className="mb-3 text-sm font-semibold tracking-[0.14em] text-white/70 uppercase">
              Machine learning estimates
            </p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Find Your Dream Home Value with AI
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
              Use our Machine Learning model to predict the estimated price of a house based on your
              inputs.
            </p>
            <Link to="/predict" className="mt-8 inline-flex">
              <Button size="lg" className="px-6">
                Predict House Price
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative border-t border-white/10 bg-navy/55">
          <ul className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:grid-cols-3 md:px-6">
            <HeroStat icon={<BarChart3 className="size-5" />} title="Accurate Predictions" />
            <HeroStat icon={<Zap className="size-5" />} title="Fast & Easy to Use" />
            <HeroStat icon={<Shield className="size-5" />} title="Powered by Machine Learning" />
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <InfoCard
            step="01"
            title="Enter house details"
            body="Location, area, bedrooms, parking, age, and furnishing — the same features the model was trained on."
          />
          <InfoCard
            step="02"
            title="Run the ensemble"
            body="A linear regressor and a random-forest-style interaction layer estimate price in Indian rupees."
          />
          <InfoCard
            step="03"
            title="Read the estimate"
            body="See the predicted price, a lakhs readout, and a breakdown of the details you submitted."
          />
        </div>
      </section>
    </div>
  );
}

function HeroStat({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <li className="flex items-center gap-3 text-sm font-medium text-white/90">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-white/10">{icon}</span>
      {title}
    </li>
  );
}

function InfoCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <article className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      <p className="font-display text-xs font-semibold tracking-[0.16em] text-primary uppercase">{step}</p>
      <h2 className="mt-2 font-display text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}
