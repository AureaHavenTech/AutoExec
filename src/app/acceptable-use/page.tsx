'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function AcceptableUsePage() {
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
        <div className="mb-12"><h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Acceptable Use Policy</h1><p className="text-slate-400 text-sm">Last updated: July 4, 2026</p></div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">1. Prohibited Content</h2>
          <p>You may not use Axel AI to create or distribute: illegal content, hate speech, harassment, threats, CSAM, explicit sexual content, content promoting self-harm, malware, spam, phishing, deceptive content, or content infringing on intellectual property rights.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">2. Prohibited Activities</h2>
          <p>You may not: reverse engineer the platform, circumvent security measures, create multiple accounts for trial abuse, resell access without authorization, or use the service for AI model training of competing services.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">3. AI-Generated Content</h2>
          <p>Review all AI outputs before use. You are responsible for content published through Axel AI. Comply with all applicable laws regarding AI-generated content disclosure.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">4. Enforcement</h2>
          <p>Violations may result in content removal, account suspension, termination, forfeiture of prepaid fees, and/or reporting to law enforcement.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">5. Reporting</h2>
          <p>Report violations to <a href="mailto:aurahaven@gmail.com" className="text-brand-400 hover:text-brand-300">aurahaven@gmail.com</a>.</p></section>
        </div>
      </main>
    </div>
  );
}