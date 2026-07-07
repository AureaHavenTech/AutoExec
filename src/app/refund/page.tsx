'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function RefundPage() {
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
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Refund Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: July 4, 2026</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="text-emerald-400 text-sm font-bold">30-Day Money-Back Guarantee</span>
          </div>
        </div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">1. Our Guarantee</h2>
          <p>We offer a <strong className="text-white">30-day money-back guarantee</strong> on all Axel AI subscription plans (Starter, Pro, Unlimited). If you&apos;re not satisfied, contact us within 30 days of purchase for a full refund — no questions asked.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">2. How to Request</h2>
          <p>Email <a href="mailto:aurahaven@gmail.com" className="text-brand-400 hover:text-brand-300">aurahaven@gmail.com</a> with &quot;Refund Request&quot; in the subject line. Include your account email. Refunds are processed within 5-10 business days to the original payment method.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">3. Cancellation</h2>
          <p>Cancel anytime from account settings. Your subscription remains active until the end of the billing period. Data is retained for 30 days after cancellation.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">4. Contact</h2>
          <p>Email: <a href="mailto:aurahaven@gmail.com" className="text-brand-400 hover:text-brand-300">aurahaven@gmail.com</a></p></section>
        </div>
      </main>
    </div>
  );
}