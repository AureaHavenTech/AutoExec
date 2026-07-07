'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function AffiliateTermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-serif">Axel AI</span>
        </Link>
        <Link href="/dashboard"><Button variant="default" size="sm">Dashboard</Button></Link>
      </header>
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="mb-12"><h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Affiliate Program Terms</h1><p className="text-slate-400 text-sm">Last updated: July 4, 2026</p></div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">1. Program Overview</h2>
          <p>The Axel AI Affiliate Program lets you earn 10% commission on referred customers&apos; first subscription payment. Operated by Aura Haven Tech.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">2. Commission Details</h2>
          <p>10% of first payment. $50 minimum payout threshold. Monthly payouts via PayPal or bank transfer. 30-day cookie duration. Affiliates must be 18+ and have an active Axel AI account.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">3. Approved Marketing</h2>
          <p>Social media posts, blog content, YouTube videos, email to existing subscribers. Prohibited: paid search on branded keywords, spam, coupon/deal sites, self-referrals, fake accounts.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">4. Disclosure</h2>
          <p>You must clearly disclose affiliate relationships in all promotional content as required by FTC guidelines.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">5. Contact</h2>
          <p>Email: <a href="mailto:aurahaven@gmail.com" className="text-brand-400 hover:text-brand-300">aurahaven@gmail.com</a></p></section>
        </div>
      </main>
    </div>
  );
}