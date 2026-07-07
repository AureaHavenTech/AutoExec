'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function CookiesPage() {
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
        <div className="mb-12"><h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Cookie Policy</h1><p className="text-slate-400 text-sm">Last updated: July 4, 2026</p></div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">1. What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit our website. Axel AI uses cookies to authenticate your session, remember your preferences, and improve your experience. We use essential cookies (required for login and security), functional cookies (preferences and settings), and analytics cookies (anonymized usage data).</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">2. Third-Party Cookies</h2>
          <p>Stripe uses cookies for payment processing. OpenAI API calls are processed server-side without cookies. Social platform integrations may set cookies according to their own policies.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">3. Your Choices</h2>
          <p>You can control cookies via browser settings. Blocking essential cookies may affect platform functionality. We respect Do Not Track signals.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">4. Contact</h2>
          <p>Email: <a href="mailto:aurahaven@gmail.com" className="text-brand-400 hover:text-brand-300">aurahaven@gmail.com</a></p></section>
        </div>
      </main>
    </div>
  );
}