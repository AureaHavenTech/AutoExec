'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function DPAPage() {
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
        <div className="mb-12"><h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Data Processing Agreement</h1><p className="text-slate-400 text-sm">Last updated: July 4, 2026</p></div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">1. Parties</h2>
          <p>This DPA is between you (&quot;Controller&quot;) and Aura Haven Tech (&quot;Processor&quot;), operator of Axel AI. It forms part of the Terms of Service.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">2. Processing Details</h2>
          <p><strong className="text-white">Subject Matter:</strong> AI-powered business task execution. <strong className="text-white">Duration:</strong> Subscription term + 30 days. <strong className="text-white">Data Types:</strong> Task descriptions, business data, research results, email outreach content, storefront data, and analytics.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">3. Processor Obligations</h2>
          <p>Process data only on your instructions. Implement security measures (AES-256, TLS 1.3, access controls). Notify you within 48 hours of data breaches. Delete or return data at end of service.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">4. Sub-processors</h2>
          <p>OpenAI (AI processing), Stripe (payments), Vercel (hosting), Turso (database). We will notify you of any changes to sub-processors.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">5. International Transfers</h2>
          <p>Data may be processed in the US and other countries where sub-processors operate. Standard Contractual Clauses (SCCs) and UK IDTA are in place for adequate safeguards.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">6. Contact</h2>
          <p>Email: <a href="mailto:aurahaven@gmail.com" className="text-brand-400 hover:text-brand-300">aurahaven@gmail.com</a></p></section>
        </div>
      </main>
    </div>
  );
}