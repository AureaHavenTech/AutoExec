'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, Gift, DollarSign, Users, ArrowRight } from "lucide-react";

export default function AffiliatePage() {
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
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Affiliate Program</h1>
          <p className="text-slate-400 text-lg">Earn 10% commission on every referral — for life.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: <Users className="w-6 h-6 text-brand-400" />, title: "1. Share", desc: "Get your unique referral link and share it with your audience." },
            { icon: <DollarSign className="w-6 h-6 text-brand-400" />, title: "2. Earn", desc: "When someone signs up using your link, you earn 10% of every payment they make — forever." },
            { icon: <Gift className="w-6 h-6 text-brand-400" />, title: "3. Get Paid", desc: "Commissions are paid monthly via Stripe. Track your earnings in real-time." },
          ].map((step, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">{step.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-brand-500/10 to-transparent border border-brand-500/20 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-3 font-serif">Why Partner With Us?</h2>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-2"><span className="text-brand-400 font-bold mt-1">10%</span> lifetime commission on all referrals</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 font-bold mt-1">Real-time</span> dashboard to track clicks, signups, and earnings</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 font-bold mt-1">Monthly</span> payouts via Stripe</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 font-bold mt-1">Dedicated</span> support for top affiliates</li>
          </ul>
        </div>

        <div className="text-center">
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-slate-500 text-xs mt-4">
            By participating, you agree to our{" "}
            <Link href="/affiliate-terms" className="text-brand-400 hover:text-brand-300">Affiliate Terms</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
