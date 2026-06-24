"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Bot, 
  Check, 
  Globe, 
  Mail, 
  Search, 
  Send, 
  Sparkles, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowUpRight
} from "lucide-react";

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const features = [
    {
      icon: Search,
      title: "Deep Web Research",
      description: "Axel AI autonomously navigates directories, search engines, and social platforms to find verified prospects.",
    },
    {
      icon: Mail,
      title: "Personalized Email Outreach",
      description: "Drafts hyper-personalized email templates based on recipient profiles and sends them immediately.",
    },
    {
      icon: Bot,
      title: "Autonomous Agent Core",
      description: "No APIs required. Our AI browsers click, scroll, and retrieve data like a human assistant.",
    },
    {
      icon: Sparkles,
      title: "Context-Aware Leads",
      description: "Filter leads dynamically by specific triggers, e.g., 'SaaS companies in SF hiring full-stack devs'.",
    }
  ];

  const pricingTiers = [
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: 39,
      annualPrice: 31,
      description: "Essential tools for solo founders beginning outreach.",
      features: [
        "50 tasks per month",
        "Basic web research",
        "Single-step email templates",
        "Email delivery support",
        "Standard execution speed",
        "Community support"
      ],
      popular: false,
      cta: "Get Started"
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 99,
      annualPrice: 79,
      description: "Full automation power for active sales and prospecting.",
      features: [
        "200 tasks per month",
        "Deep web research & scraping",
        "Multi-step automated email outreach",
        "AI-driven personalization",
        "Priority task processing",
        "Email & chat support",
        "Custom agent triggers"
      ],
      popular: true,
      cta: "Go Pro"
    },
    {
      id: "unlimited",
      name: "Unlimited",
      monthlyPrice: 249,
      annualPrice: 199,
      description: "Zero restrictions. Uncapped research and outreach scaling.",
      features: [
        "No task limit (uncapped)",
        "Deep web research + browser agents",
        "Bulk outbound email campaigns",
        "Dedicated proxy configuration",
        "Instant execution speed",
        "Dedicated account manager",
        "Custom API integrations"
      ],
      popular: false,
      cta: "Go Unlimited"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Axel AI Logo" className="h-9 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm">
              Launch App <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-44 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Ambient background glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/3 w-[300px] h-[300px] bg-accent-500/10 rounded-full blur-[100px] pointer-events-none" />

        <Badge variant="info" className="mb-6 px-4 py-1 text-xs tracking-wider uppercase font-semibold">
          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-brand-400 animate-pulse" /> Built for people who have more to do than hours in the day
        </Badge>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight md:leading-none text-white">
          Tell it what to do. <br />
          <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-accent-400 bg-clip-text text-transparent">
            It does the rest.
          </span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed">
          Axel AI is your autonomous AI executive assistant. Describe any task in plain language — 
          research, list-building, email outreach, building webpages — and it handles everything 
          end-to-end. Like a full-time employee who works 24/7, never sleeps, and does anything you can describe.
        </p>

        {/* Demo command block */}
        <div className="mt-10 p-4 rounded-xl border border-slate-800 bg-slate-900/60 max-w-2xl w-full text-left font-mono text-sm shadow-2xl backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="text-brand-500 font-bold">&gt;</span>
            <span className="text-slate-200">
              Find me 50 SaaS companies hiring in SF and draft an intro email
            </span>
          </div>
          <Link href="/dashboard">
            <span className="text-xs bg-brand-500 text-white px-2.5 py-1 rounded-md font-sans font-semibold cursor-pointer hover:bg-brand-600 flex items-center space-x-1">
              <span>Execute</span> <ArrowUpRight className="h-3 w-3" />
            </span>
          </Link>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-4">
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="#pricing">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-4">
              View Pricing
            </Button>
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>30-day money-back guarantee · No risk</span>
        </div>

        <div className="mt-16 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-slate-500 text-sm font-semibold tracking-wider uppercase">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-slate-400" />
            <span>Browser-Driven</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-slate-400" />
            <span>Smart Emailing</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-slate-400" />
            <span>GDPR Compliant</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              An Executive Assistant built entirely on AI
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              No complex setup, APIs, or integration connectors needed. Axel AI acts like a real person 
              — because it was built by one who needed exactly that.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="bg-slate-900/40 border-slate-900 hover:border-slate-800 transition-all duration-300">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-brand-400" />
                    </div>
                    <CardTitle className="text-lg text-white font-bold">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 border-t border-slate-900 bg-slate-900/10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Watch Axel AI run autonomously
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Three simple steps to save hours of grinding. Let the agent handle it — 
              like having a full-time employee who never sleeps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-xl text-brand-400 mb-6 shadow-lg shadow-brand-500/5">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Submit Task</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Write a description of what you need found or done. Use plain English and be as descriptive as you like.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-accent-500/10 border border-accent-500/20 flex items-center justify-center font-bold text-xl text-accent-400 mb-6 shadow-lg shadow-accent-500/5">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Agent Processes</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Our web browser agent initializes in the cloud, performing searches, parsing details, and composing outreaches.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-xl text-brand-400 mb-6 shadow-lg shadow-brand-500/5">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Download Results</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Monitor live logs. Once finished, retrieve the compiled list of leads or inspect automated outreach drafts ready to go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story Section */}
      <section className="py-24 border-t border-slate-900 bg-slate-900/5 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Badge variant="info" className="mb-6 px-4 py-1 text-xs tracking-wider uppercase font-semibold">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-brand-400" /> The Story Behind Axel AI
          </Badge>
          <blockquote className="text-2xl md:text-3xl font-semibold text-white leading-relaxed max-w-3xl mx-auto">
            &ldquo;I was juggling multiple businesses from my phone. No laptop. No budget for employees. 
            I needed an assistant that worked 24/7 without a salary. So I built one.&rdquo;
          </blockquote>
          <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
            Axel AI was born from real life, real overwhelm, and the need for something that just works. 
            It&apos;s for everyone else who has more to do than hours in the day.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className="h-px w-8 bg-slate-800" />
            <span>— Founder, Axel AI</span>
            <span className="h-px w-8 bg-slate-800" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-900 bg-slate-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight text-white">
              Simple, task-based pricing
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Start free, upgrade as your demand scales. No setup charges — and a 
              <span className="text-emerald-400 font-semibold"> 30-day money-back guarantee</span> on every plan.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center space-x-4">
              <span className={`text-sm ${!isAnnual ? "text-white font-semibold" : "text-slate-400"}`}>
                Monthly Billing
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative h-6 w-11 rounded-full bg-slate-800 transition-colors duration-200 outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-brand-500 shadow-md transform transition-transform duration-200 ${
                    isAnnual ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-sm flex items-center space-x-1.5 ${isAnnual ? "text-white font-semibold" : "text-slate-400"}`}>
                <span>Annual Billing</span>
                <Badge variant="success" className="text-[10px] px-1.5 py-0">
                  Save 20%
                </Badge>
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {pricingTiers.map((tier) => {
              const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
              return (
                <Card 
                  key={tier.id} 
                  className={`relative flex flex-col h-full bg-slate-900/30 transition-all duration-300 ${
                    tier.popular 
                      ? "border-brand-500 shadow-2xl shadow-brand-500/10 scale-105 z-10" 
                      : "border-slate-900 hover:border-slate-800"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge variant="info" className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                    <CardDescription className="min-h-[40px] mt-2">{tier.description}</CardDescription>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-5xl font-extrabold text-white">${price}</span>
                      <span className="text-slate-400 text-sm ml-2">/ month</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>30-day money-back guarantee</span>
                    </div>
                    {isAnnual && (
                      <span className="text-xs text-emerald-400 mt-1.5 block">
                        Billed annually (${price * 12}/yr)
                      </span>
                    )}
                  </CardHeader>

                  <CardContent className="flex-grow">
                    <div className="border-t border-slate-800/60 my-4" />
                    <ul className="space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3 text-sm text-slate-300">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-4">
                    <Link href={`/dashboard?tier=${tier.id}`} className="w-full">
                      <Button 
                        variant={tier.popular ? "primary" : "outline"} 
                        className="w-full py-3 font-semibold"
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 30-Day Money Back Guarantee */}
      <section className="py-20 border-t border-slate-900 bg-slate-900/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-emerald-500/5 to-brand-500/5 border border-emerald-500/10 rounded-2xl p-10 md:p-14">
            <ShieldCheck className="h-14 w-14 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
              30-Day Money-Back Guarantee
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-2">
              Try Axel AI risk-free. If you&apos;re not satisfied within 30 days, 
              get a full refund. No questions asked.
            </p>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              We&apos;re confident Axel AI will save you hours every day. But if it doesn&apos;t work 
              for you, we&apos;ll refund every penny. That&apos;s how sure we are that you&apos;ll love it.
            </p>
            <div className="mt-8">
              <Link href="/dashboard">
                <Button variant="primary" size="lg" className="text-base px-8 py-4">
                  Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 px-6 bg-slate-950 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Zap className="h-4 w-4 text-brand-500 fill-brand-500" />
            <span className="font-bold text-white tracking-tight">Axel AI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-400 mb-4 md:mb-0">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/affiliates" className="hover:text-white transition-colors">Affiliates</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>30-day money-back guarantee</span>
            </div>
            <div>&copy; {new Date().getFullYear()} Axel AI AI Inc. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
