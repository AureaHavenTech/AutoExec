"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, DollarSign, Users, Share2, TrendingUp, Gift, CheckCircle2, ArrowRight, Percent, ShieldCheck } from "lucide-react";

export default function AffiliatesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Axel AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/affiliates" className="text-white">Affiliates</Link>
        </nav>
        <Link href="/dashboard"><Button variant="primary" size="sm">Launch App</Button></Link>
      </header>

      <main className="pt-32 pb-24 px-6">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <Badge variant="info" className="mb-6 px-4 py-1 text-xs uppercase font-semibold tracking-wider">
            <Percent className="h-3.5 w-3.5 mr-1.5" /> Affiliate Program
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Earn <span className="text-brand-400">10% Commission</span> <br />on Every Referral
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Join the Axel AI affiliate program and earn recurring 10% commissions on every subscription 
            you refer. Zero-cost marketing for content creators, UGC creators, and entrepreneurs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button variant="primary" size="lg" className="text-base px-8 py-4">
                Apply Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="text-base px-8 py-4">
                See How It Works
              </Button>
            </a>
          </div>
        </div>

        {/* How it works */}
        <section id="how-it-works" className="max-w-6xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Share2, title: "Share Your Link", desc: "Get your unique affiliate link and share it with your audience — social media, YouTube, blog, or email list." },
              { step: "02", icon: Users, title: "They Sign Up", desc: "When someone clicks your link and subscribes to Axel AI, they're tagged as your referral automatically." },
              { step: "03", icon: DollarSign, title: "You Earn 10%", desc: "You earn 10% recurring commission on every payment they make. No cap on earnings." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-slate-900/30 border border-slate-900 rounded-xl p-8 text-center">
                  <div className="h-14 w-14 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6 text-brand-400 font-bold text-xl">
                    {item.step}
                  </div>
                  <Icon className="h-8 w-8 text-brand-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Earnings calculator */}
        <section className="max-w-4xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">What You Could Earn</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { referrals: "10", title: "10 Referrals", earning: "$99 - $2,490/mo", desc: "Share with a small email list or social following" },
              { referrals: "50", title: "50 Referrals", earning: "$495 - $12,450/mo", desc: "Active social media creator or niche blogger" },
              { referrals: "100", title: "100 Referrals", earning: "$990 - $24,900/mo", desc: "Established YouTuber, podcaster, or newsletter writer" },
            ].map((tier, i) => (
              <div key={i} className={`bg-slate-900/30 border ${i === 1 ? "border-brand-500 scale-105" : "border-slate-900"} rounded-xl p-8 text-center relative`}>
                {i === 1 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="info" className="px-3 py-1 text-[11px] font-bold uppercase">Most Common</Badge>
                  </div>
                )}
                <div className="text-3xl font-extrabold text-brand-400 mb-2">{tier.referrals}</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider mb-4">{tier.title}</div>
                <div className="text-2xl font-bold text-white mb-2">{tier.earning}</div>
                <div className="text-xs text-slate-500">{tier.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-4xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: DollarSign, title: "Recurring Income", desc: "Earn 10% on every payment, every month — not just one-time." },
              { icon: Gift, title: "No Minimum Payout", desc: "Get paid whatever you earn, whenever you want via PayPal or bank transfer." },
              { icon: TrendingUp, title: "High Conversion", desc: "Axel AI solves a real pain point — busy people need AI assistants. High conversion rates." },
              { icon: Share2, title: "Creative Freedom", desc: "Make tutorials, reviews, comparison videos, or just share your link. No restrictive scripts." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-4 bg-slate-900/20 border border-slate-900 rounded-xl p-6">
                  <Icon className="h-8 w-8 text-brand-400 shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-brand-500/10 to-accent-500/10 border border-brand-500/20 rounded-2xl p-12">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Start Earning?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Join hundreds of creators already earning 10% recurring commissions with Axel AI.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg" className="text-base px-8 py-4">
              Apply to the Program <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-12 px-6 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Zap className="h-4 w-4 text-brand-500 fill-brand-500" />
            <span className="font-bold text-white">Axel AI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-400 mb-4 md:mb-0">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/affiliates" className="hover:text-white transition-colors">Affiliates</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="https://onepostai.app" target="_blank" className="hover:text-white transition-colors">One Post AI</a>
            <a href="https://aurahaven.shop" target="_blank" className="hover:text-white transition-colors">Aura Haven</a>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 text-emerald-400 text-xs mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>30-day money-back guarantee</span>
            </div>
            <div>&copy; {new Date().getFullYear()} Axel AI AI Inc.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}