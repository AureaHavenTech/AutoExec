'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function AupPage() {
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
        <div className="mb-12"><h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Acceptable Use Policy</h1><p className="text-slate-400 text-sm">Last updated: July 4, 2026</p></div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 font-serif">1. Acceptable Use</h2>
            <p>Axel AI is an AI-powered business assistant designed to automate legitimate business tasks. You agree to use our platform responsibly and within the bounds of applicable laws.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 font-serif">2. Prohibited Activities</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Automating illegal activities or fraud</li>
              <li>Sending unsolicited bulk emails or spam</li>
              <li>Scraping personal data without consent</li>
              <li>Impersonating others or creating fake identities</li>
              <li>Distributing malware or harmful code</li>
              <li>Circumventing rate limits or security measures</li>
              <li>Using Axel AI to harass, threaten, or harm others</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 font-serif">3. API & Service Usage</h2>
            <p>You agree to comply with the terms of any third-party services connected through Axel AI (OpenAI, Google, Shopify, etc.). Excessive or abusive API usage may result in throttling or account suspension.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 font-serif">4. Content & Data</h2>
            <p>You retain ownership of your data. You are responsible for ensuring you have the right to process any data you submit to Axel AI. We do not monitor task content but reserve the right to investigate violations.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 font-serif">5. Enforcement</h2>
            <p>Violations may result in warnings, task restrictions, account suspension, or permanent termination. We reserve the right to take action based on the severity and frequency of violations.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 font-serif">6. Reporting</h2>
            <p>Report violations to <a href="mailto:aurahaventech@gmail.com" className="text-brand-400 hover:text-brand-300">aurahaventech@gmail.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
