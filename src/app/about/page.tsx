"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/ui/footer";
import { Zap, ShieldCheck, Users, Quote, Sparkles, Heart, ArrowRight, Camera } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Axel AI Logo" className="h-9 w-auto" />
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
            Axel AI isn&apos;t another Silicon Valley startup. It was born from real life, 
            real overwhelm, and the need for something that just works.
          </p>
        </div>

        {/* Founder Story - Full width, emotional */}
        <section className="mb-24">
          <div className="grid md:grid-cols-5 gap-10 items-start">
            {/* CEO Photo */}
                            <div className="md:col-span-2">
                              <div className="relative flex flex-col items-center">
                                {/* Circular photo frame */}
                                <div className="relative w-64 h-64 rounded-full border-4 border-brand-500/30 overflow-hidden shadow-2xl shadow-brand-500/10 transition-all duration-300">
                                  <img
                                    src="/ceo-photo.png"
                                    alt="Lindsey - Founder & CEO"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs text-slate-500 mt-4 max-w-[200px] text-center leading-relaxed">
                                  Lindsey — Founder & CEO
                                </p>
                              </div>
                            </div>

            {/* Story text - Lindsey's personal story */}
                          <div className="md:col-span-3 space-y-6">
                            <div className="relative">
                              <Quote className="h-10 w-10 text-brand-500/20 absolute -top-2 -left-3" />
                              <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed pl-6">
                                Hi, I&apos;m Lindsey.
                              </p>
                            </div>

                            <div className="space-y-5 text-slate-300 leading-relaxed text-lg">
                              <p>
                                I&apos;m not a big tech company or a team of executives sitting in a boardroom.
                                I&apos;m a mom, creator, and entrepreneur who knows what it&apos;s like to feel
                                overwhelmed while trying to build a life you&apos;re proud of.
                              </p>
                              <p>
                                I built these apps because I needed them myself.
                              </p>
                              <p>
                                I wanted to create, grow, and pursue my dreams without sacrificing my family,
                                my career, or the parts of myself that often get lost while taking care of everyone else.
                                I was tired of feeling like I had to choose between showing up for my responsibilities
                                and showing up for myself.
                              </p>
                              <p>
                                Technology should make life easier, not more overwhelming. It should help people
                                bring their ideas to life, reclaim their time, and create something meaningful —
                                even if they only have a few minutes a day.
                              </p>
                              <p>
                                My hope is that these tools give you more than productivity. I hope they give you
                                confidence, consistency, and the reminder that your dreams still matter.
                              </p>
                              <p>
                                This is especially close to my heart for the busy moms who spend so much of their
                                lives pouring into everyone else that they forget they deserve something of their
                                own, too. A purpose. A passion. A chance to build a name, a business, or simply
                                prove to themselves that they&apos;re capable of more than just surviving.
                              </p>
                              <p>
                                If these apps help you feel a little less overwhelmed, a little more supported,
                                and a little closer to the life you&apos;re working so hard to create, then
                                they&apos;ve done exactly what I hoped they would.
                              </p>
                              <p className="text-white font-medium text-xl">
                                From one busy human trying to do it all to another — I&apos;m so glad you&apos;re here.
                              </p>
                              <p className="text-brand-400 font-semibold pt-2">
                                — Lindsey, Founder
                              </p>
                            </div>
                          </div>
          </div>
        </section>

        {/* Dedication */}
        <div className="text-center mb-16">
          <p className="text-lg text-slate-400 italic">
            💜 Dedicated to my mom, who never gives up on me.
          </p>
        </div>

        {/* Follow the Founder */}
            <section className="mb-16 text-center">
              <div className="inline-block bg-gradient-to-r from-brand-500/10 to-accent-500/5 border border-brand-500/20 rounded-2xl p-8 md:p-10 px-12">
                <h2 className="text-2xl font-bold text-white mb-2">Follow the Founder</h2>
                <p className="text-slate-400 text-sm mb-6">Stay connected with Lindsey and the journey</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="https://instagram.com/funkycoldmedemaa" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-brand-500/30 text-slate-300 hover:text-white transition-all duration-200 text-sm font-medium">
                    <span>📸</span> Instagram
                  </a>
                  <a href="https://tiktok.com/@funkycoldmedemaa" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-brand-500/30 text-slate-300 hover:text-white transition-all duration-200 text-sm font-medium">
                    <span>🎵</span> TikTok
                  </a>
                  <a href="https://twitter.com/funkycoldmedemaa" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-brand-500/30 text-slate-300 hover:text-white transition-all duration-200 text-sm font-medium">
                    <span>🐦</span> Twitter/X
                  </a>
                  <a href="https://youtube.com/@funkycoldmedemaa" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-brand-500/30 text-slate-300 hover:text-white transition-all duration-200 text-sm font-medium">
                    <span>▶️</span> YouTube
                  </a>
                </div>
                <p className="text-xs text-slate-600 mt-4">@funkycoldmedemaa — everywhere</p>
              </div>
            </section>

            {/* Sister Companies */}
            <section className="mb-24 text-center">
              <div className="bg-gradient-to-r from-brand-500/5 to-accent-500/5 border border-brand-500/10 rounded-2xl p-10 md:p-14">
                <Badge variant="info" className="mb-4">The Aura Haven Tech Family</Badge>
                <h2 className="text-3xl font-bold text-white mb-3">Our Sister Companies</h2>
                <p className="text-slate-400 text-sm mb-8 max-w-lg mx-auto">
                  Tools built to help you create, grow, and thrive across every part of your business.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <a href="https://onepostai.ctonew.app" target="_blank" className="flex items-center gap-4 p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-brand-500/30 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#b8944a] flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">1P</div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-white">One Post AI</div>
                      <div className="text-sm text-slate-500">Content that moves. One app for all your social media.</div>
                    </div>
                  </a>
                  <a href="https://aurahaven.shop" target="_blank" className="flex items-center gap-4 p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-brand-500/30 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#e8e0d4] flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">AH</div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-white">Aura Haven</div>
                      <div className="text-sm text-slate-500">Premium tech for modern living. Luxury quality gadgets.</div>
                    </div>
                  </a>
                </div>
              </div>
            </section>

            {/* Why It Matters */}
        <section className="mb-24">
          <div className="bg-gradient-to-r from-brand-500/5 to-accent-500/5 border border-brand-500/10 rounded-2xl p-10 md:p-14">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Axel AI Exists</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Time is everything",
                  desc: "When you're running multiple businesses from your phone, every minute counts. Axel AI does in seconds what takes hours manually."
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
            Join thousands of busy founders and entrepreneurs who use Axel AI to handle the grunt work.
          </p>
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="text-base px-8 py-4">
              Try Axel AI Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-xs text-slate-500 mt-4">30-day money-back guarantee. No risk.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
