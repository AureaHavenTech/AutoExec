'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, Check } from "lucide-react";

const STRIPE_LINKS: Record<string, string> = {
  starter: "https://buy.stripe.com/aFa6oH4nx8GM0fb9XYcwg0o",
  pro: "https://buy.stripe.com/9B628r3jt1ekge93zAcwg0p",
  unlimited: "https://buy.stripe.com/00wcN5g6f4qwaTP2vwcwg0q",
};

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: "$39",
    period: "/mo",
    description: "For solo founders getting started",
    cta: "Start Free Trial",
    features: [
      "50 tasks per month",
      "Basic research & email",
      "Single user",
      "Email support",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    period: "/mo",
    description: "For growing businesses",
    cta: "Start Free Trial",
    features: [
      "200 tasks per month",
      "Full web research + send emails",
      "Calendar & Shopify integrations",
      "Priority support",
      "Custom workflows",
    ],
    popular: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: "$249",
    period: "/mo",
    description: "For power users and agencies",
    cta: "Go Unlimited",
    features: [
      "No task cap",
      "Priority processing",
      "All integrations",
      "Dedicated support",
      "Early access to new features",
      "Unlimited task automation",
    ],
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-serif">Axel AI</span>
        </Link>
        <Link href="/dashboard"><Button variant="primary" size="sm">Dashboard</Button></Link>
      </header>
      <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Simple, Transparent Pricing</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include a 30-day money-back guarantee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-slate-900/60 border rounded-2xl p-8 flex flex-col ${
                tier.popular
                  ? "border-brand-500/50 ring-1 ring-brand-500/20"
                  : "border-slate-800"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-slate-400 text-sm">{tier.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                <span className="text-slate-400 text-sm">{tier.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a href={STRIPE_LINKS[tier.id]} target="_blank" rel="noopener noreferrer">
                <Button
                  variant={tier.popular ? "primary" : "ghost"}
                  size="lg"
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </a>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            All plans include a 30-day money-back guarantee. No questions asked.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Need something custom?{" "}
            <a href="mailto:aurahaventech@gmail.com" className="text-brand-400 hover:text-brand-300">
              Contact us
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
