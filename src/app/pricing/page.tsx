'use client';

import React from "react";
import Link from "next/link";
import { Check, Zap, Shield, ArrowRight, Bot } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$39",
    period: "/month",
    tasks: "50 tasks/mo",
    description: "AI-powered assistance for getting started.",
    features: [
      "50 AI tasks per month",
      "AI chat assistant (GPT-4o)",
      "Task organization & notes",
      "Calendar & reminders",
      "Email support",
    ],
    cta: "Get Started",
    href: "https://buy.stripe.com/4gw9C58KGbcu6zm9AB",
    featured: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    tasks: "200 tasks/mo",
    description: "Advanced AI automation for growing businesses.",
    features: [
      "200 AI tasks per month",
      "Advanced AI research & analysis",
      "Multi-step task workflows",
      "Multiple integrations",
      "Calendar scheduling",
      "Priority task processing",
      "Priority support",
    ],
    cta: "Go Pro",
    href: "https://buy.stripe.com/14k9C5f2U9QieLC5km",
    featured: true,
  },
  {
    name: "Unlimited",
    price: "$249",
    period: "/month",
    tasks: "Unlimited tasks",
    description: "No caps. Priority everything. For founders scaling their business.",
    features: [
      "Unlimited AI tasks",
      "All Pro features",
      "Unlimited integrations",
      "Custom workflow builder",
      "Priority onboarding",
      "White-glove onboarding",
      "Dedicated support line",
    ],
    cta: "Go Unlimited",
    href: "https://buy.stripe.com/7sI9C5g7Y9QigOI9AF",
    featured: false,
  },
];

const creditPacks = [
  { name: "Starter Pack", tasks: "50 credits", price: "$9", href: "https://buy.stripe.com/aEU9C56yQbcu6zm8wD" },
  { name: "Creator Pack", tasks: "200 credits", price: "$29", href: "https://buy.stripe.com/4gwg1l7GUfAC2qY4gn" },
  { name: "Pro Pack", tasks: "500 credits", price: "$59", href: "https://buy.stripe.com/28o8y59WS9QigOI8wF" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">Axel AI™</span>
        </Link>
        <Link href="/">
          <span className="text-sm text-slate-400 hover:text-white transition-colors">← Back to Home</span>
        </Link>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
              Simple, <span className="text-brand-400">task-based pricing</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Start free, upgrade as your demand scales. No setup charges — and a{" "}
              <span className="text-emerald-400 font-semibold">30-day money-back guarantee</span> on every plan.
            </p>
          </div>

          {/* Subscription Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  tier.featured
                    ? "border-brand-500/40 bg-brand-500/5 shadow-xl shadow-brand-500/10"
                    : "border-slate-800 bg-slate-900/50"
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-500 text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{tier.tasks}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-slate-400 text-sm">{tier.period}</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all inline-flex items-center justify-center gap-2 ${
                    tier.featured
                      ? "bg-brand-500 text-white hover:bg-brand-400"
                      : "border border-brand-500/30 text-brand-400 hover:bg-brand-500/10"
                  }`}
                >
                  {tier.cta} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          {/* Credit Packs */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">One-Time Credit Packs</h2>
            <p className="text-slate-400 text-sm mb-8">Need extra tasks? Grab credits without a subscription.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              {creditPacks.map((pack) => (
                <a
                  key={pack.name}
                  href={pack.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-slate-800 rounded-xl p-5 hover:border-brand-500/30 transition-all bg-slate-900/50 text-center"
                >
                  <p className="text-xs text-slate-400 mb-1">{pack.tasks}</p>
                  <p className="text-2xl font-bold text-brand-400 mb-1">{pack.price}</p>
                  <p className="text-xs text-slate-500">one-time</p>
                </a>
              ))}
            </div>
          </div>

          {/* Guarantee */}
          <div className="text-center border-t border-slate-800 pt-8">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-sm">
              <Shield className="h-4 w-4" />
              <span>30-day money-back guarantee on all plans</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Not satisfied? Full refund within 30 days. No questions asked.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-slate-500">
            © 2026 Aura Haven Tech. All rights reserved. Axel AI™ is a product of Aura Haven Tech.
          </p>
        </div>
      </footer>
    </div>
  );
}
