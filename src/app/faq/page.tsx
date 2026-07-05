"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { Zap, ChevronDown, ChevronRight, Search, ShieldCheck } from "lucide-react";

const faqs = [
  {
    q: "What is Axel AI?",
    a: "Axel AI is an autonomous AI executive assistant. You describe any digital task in plain language — research, list-building, email outreach, data gathering, building webpages — and Axel AI completes it end-to-end without you needing to lift a finger."
  },
  {
    q: "How is Axel AI different from ChatGPT or other AI tools?",
    a: "Axel AI doesn't just chat — it executes. While ChatGPT gives you text answers, Axel AI actually performs tasks: it searches the web, scrapes data, compiles spreadsheets, drafts and sends emails, builds webpages, and more. It's like having a full-time employee who can do anything you describe."
  },
  {
    q: "What kind of tasks can Axel AI do?",
    a: "Axel AI can: research companies and people on the web, build prospect lists with verified contacts, draft and send personalized email campaigns, gather competitive intelligence, scrape websites for structured data, build and host simple webpages, analyze market trends, and more. If it can be done digitally, Axel AI can do it."
  },
  {
    q: "How much does Axel AI cost?",
    a: "We have three plans: Starter ($39/mo for 50 tasks), Pro ($99/mo for 200 tasks), and Unlimited ($249/mo with no task cap). All plans include core features. Annual billing saves ~20%."
  },
  {
    q: "Is there a free trial?",
    a: "Yes! You can start with a 30-day free trial and explore the dashboard. You'll be able to submit tasks and see how Axel AI works before committing to a paid plan."
  },
  {
    q: "How do I get started?",
    a: "Just click 'Launch App' on the homepage, create an account (or sign in), and start typing what you need done in the chat interface. Axel AI will analyze your request and execute it. It's that simple."
  },
  {
    q: "Can Axel AI send emails on my behalf?",
    a: "Yes! Axel AI can draft hyper-personalized email templates based on recipient research and send them through connected email accounts. You can review and approve before sending."
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All data is encrypted in transit and at rest. We use industry-standard security practices. Your research data, contact lists, and email drafts are private to you."
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, you can cancel anytime from the Billing page in your dashboard. Your subscription will remain active until the end of the current billing period."
  },
  {
    q: "What happens if I exceed my task limit?",
    a: "You'll receive a notification when you're approaching your limit. You can upgrade to a higher tier at any time from the Billing page. No overage fees — tasks simply pause until the next billing cycle or you upgrade."
  },
  {
    q: "Does Axel AI integrate with other tools?",
    a: "Axel AI works alongside your existing workflow. It can export data to CSV/JSON, generate webpages, and send emails. More integrations are coming soon."
  },
  {
    q: "How is One Post AI related to Axel AI?",
    a: "One Post AI is our sister product focused on social media content generation and scheduling. Axel AI and One Post AI are designed to work together — Axel AI handles research and outreach, while One Post AI manages your social media presence. Cross-promotion discounts are available."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

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
          <Link href="/faq" className="text-white">FAQ</Link>
          <Link href="/affiliates" className="hover:text-white transition-colors">Affiliates</Link>
        </nav>
        <Link href="/dashboard"><Button variant="primary" size="sm">Launch App</Button></Link>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Everything you need to know about Axel AI.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-12">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <div
              key={i}
              className="bg-slate-900/30 border border-slate-900 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-800"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-white pr-4">{faq.q}</span>
                {openIndex === i ? (
                  <ChevronDown className="h-5 w-5 text-brand-400 shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-500 shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-slate-400 leading-relaxed text-sm border-t border-slate-900/80 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">No matching questions found.</div>
          )}
        </div>

        <div className="text-center mt-12 p-8 bg-slate-900/20 border border-slate-900 rounded-xl">
          <p className="text-slate-400 mb-4">Still have questions?</p>
          <Link href="/contact"><Button variant="primary">Contact Support</Button></Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
