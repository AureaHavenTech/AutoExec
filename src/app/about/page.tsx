"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldCheck, Users, Quote, Sparkles, Heart, ArrowRight, Camera } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">AutoExec</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/about" className="text-white">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/affiliates" className="hover:text-white transition-colors">Affiliates</Link>
        </nav>
        <Link href="/dashboard">
          <Button variant="primary" size="sm">Launch App</Button>
        </Link>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-24">
          <Badge variant="info" className="mb-6 px-4 py-1 text-xs uppercase tracking-wider font-semibold">
            <Heart className="h-3.5 w-3.5 mr-1.5 text-brand-400" /> Built from Real Life
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Built by a Mom Who <br />
            <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              Didn&apos;t Have Time
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            AutoExec isn&apos;t another Silicon Valley startup. It was born from real life, 
            real overwhelm, and the need for something that just works.
          </p>
        </div>

        {/* Founder Story - Full width, emotional */}
        <section className="mb-24">
          <div className="grid md:grid-cols-5 gap-10 items-start">
            {/* CEO Photo Placeholder */}
            <div className="md:col-span-2">
              <div className="relative flex flex-col items-center">
                {/* Circular photo frame */}
                <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/10 border-4 border-brand-500/30 flex items-center justify-center overflow-hidden shadow-2xl shadow-brand-500/10 group cursor-pointer hover:border-brand-500/50 transition-all duration-300">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-brand-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-slate-400">
                      <span className="text-brand-400 font-semibold">CEO Photo</span>
                      <br />
                      <span className="text-xs text-slate-500">Coming Soon</span>
                    </p>
                  </div>
                  {/* Upload hint overlay */}
                  <div className="absolute inset-0 bg-brand-500/0 hover:bg-brand-500/10 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white/0 hover:text-white/80 text-xs font-semibold transition-all duration-300">
                      Upload from dashboard
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-4 max-w-[200px] text-center leading-relaxed">
                  Upload your photo from the dashboard settings to personalize this page.
                </p>
              </div>
            </div>

            {/* Story text - exact brand narrative */}
            <div className="md:col-span-3 space-y-6">
              <div className="relative">
                <Quote className="h-10 w-10 text-brand-500/20 absolute -top-2 -left-3" />
                <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed pl-6">
                  AutoExec was created by a mom who didn&apos;t have time.
                </p>
              </div>

              <div className="space-y-5 text-slate-300 leading-relaxed text-lg">
                <p>
                  Juggling multiple businesses from her phone with no laptop and no budget for employees, 
                  she needed an assistant that worked 24/7 without a salary. So she built one.
                </p>
                <p>
                  AutoExec isn&apos;t another Silicon Valley startup — it was born from real life, 
                  real overwhelm, and the need for something that just works.
                </p>
                <p className="text-white font-medium text-xl">
                  It&apos;s for everyone else who has more to do than hours in the day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="mb-24">
          <div className="bg-gradient-to-r from-brand-500/5 to-accent-500/5 border border-brand-500/10 rounded-2xl p-10 md:p-14">
            <h2 className="text-3xl font-bold mb-8 text-center">Why AutoExec Exists</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Time is everything",
                  desc: "When you're running multiple businesses from your phone, every minute counts. AutoExec does in seconds what takes hours manually."
                },
                {
                  icon: Users,
                  title: "For the empire-builders",
                  desc: "Solo founders, busy moms, entrepreneurs juggling it all — you deserve the same execution power as a whole team, without the payroll."
                },
                {
                  icon: Heart,
                  title: "Built from necessity",
                  desc: "This isn't a feature list from a board meeting. It's what one person actually needed to keep her businesses running. If it works for her, it'll work for you."
                }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="text-center">
                    <Icon className="h-10 w-10 text-brand-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-24">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10,000+", label: "Tasks Completed" },
              { value: "100%", label: "Human-Built" },
              { value: "24/7", label: "Always Working" },
              { value: "30 Days", label: "Money-Back Guarantee" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-extrabold text-brand-400">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-slate-900/30 border border-slate-900 rounded-2xl p-12">
          <Sparkles className="h-10 w-10 text-brand-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to get your time back?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Join thousands of busy founders and entrepreneurs who use AutoExec to handle the grunt work.
          </p>
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="text-base px-8 py-4">
              Try AutoExec Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-xs text-slate-500 mt-4">30-day money-back guarantee. No risk.</p>
        </div>
      </main>

      {/* Footer - consistent with landing page */}
      <footer className="border-t border-slate-900 py-12 px-6 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Zap className="h-4 w-4 text-brand-500 fill-brand-500" />
            <span className="font-bold text-white">AutoExec</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-400 mb-4 md:mb-0">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/affiliates" className="hover:text-white transition-colors">Affiliates</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 text-emerald-400 text-xs mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>30-day money-back guarantee</span>
            </div>
            <div>&copy; {new Date().getFullYear()} AutoExec AI Inc.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}