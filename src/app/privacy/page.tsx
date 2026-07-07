'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, ArrowRight } from "lucide-react";

export default function PrivacyPage() {
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
        <div className="mb-12"><h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Privacy Policy</h1><p className="text-slate-400 text-sm">Last updated: July 4, 2026</p></div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">1. Information We Collect</h2>
          <p>We collect information you provide directly: account details (name, email, billing info), task descriptions and content you submit to Axel AI, business data you upload (storefront info, product details), and communication data. We also collect usage data — features used, tasks completed, and interaction patterns — to improve our AI.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">2. How We Use Your Information</h2>
          <p>We use your data to: execute AI tasks you request, improve our AI models, process payments, send service updates, ensure security, and comply with legal obligations. We never sell your personal data. Your task data is used only to fulfill your requests.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">3. AI Processing</h2>
          <p>When you submit tasks to Axel AI, your inputs are processed by OpenAI&apos;s API. Text inputs are processed in transit and are not stored by OpenAI for training purposes. We do not use your business data to train external models. See our <Link href="/dpa" className="text-brand-400 hover:text-brand-300">Data Processing Agreement</Link> for details.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">4. Data Security</h2>
          <p>We implement encryption at rest (AES-256) and in transit (TLS 1.3), access controls, regular security audits, and incident response procedures. Your data is stored securely and processed only as needed to provide our services.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">5. Data Retention</h2>
          <p>We retain your data for as long as your account is active. After deletion, data is retained for 30 days for recovery, then permanently deleted within 90 days. Anonymized analytics may be retained longer.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">6. Your Rights</h2>
          <p>You have the right to access, correct, delete, or port your data. To exercise these rights, email <a href="mailto:aurahaven@gmail.com" className="text-brand-400 hover:text-brand-300">aurahaven@gmail.com</a>. We will respond within 30 days.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">7. Cookies</h2>
          <p>We use essential cookies for authentication and security. See our <Link href="/cookies" className="text-brand-400 hover:text-brand-300">Cookie Policy</Link>.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">8. Contact</h2>
          <p>Email: <a href="mailto:aurahaven@gmail.com" className="text-brand-400 hover:text-brand-300">aurahaven@gmail.com</a><br />Aura Haven Tech</p></section>
        </div>
      </main>
    </div>
  );
}