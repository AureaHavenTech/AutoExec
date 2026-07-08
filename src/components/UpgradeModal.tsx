"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Lock, Zap, ArrowRight, ShoppingCart, LogIn } from "lucide-react";
import { CreditPurchase } from "@/components/CreditPurchase";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason?: string;
}

export function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
        <div className="relative w-full max-w-md animate-in zoom-in-95 duration-300">
          <Card className="p-0 overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-brand-500/10">
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-brand-500/20 via-slate-900 to-slate-900 p-6 text-center border-b border-slate-800">
              <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-3 shadow-lg shadow-brand-500/20">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Unlock Full Access</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
                {reason || "You've reached the limits of your free trial."}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Plan comparison */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 opacity-50">
                  <Lock className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Trial</p>
                    <p className="text-xs text-slate-600">25 conversations / 10 automations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-500/10 border border-brand-500/30">
                  <Zap className="h-5 w-5 text-brand-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Pro Plan</p>
                    <p className="text-xs text-slate-400">200 conversations / unlimited automations</p>
                  </div>
                  <Badge className="ml-auto text-[10px] bg-brand-500/20 text-brand-400 border-brand-500/30">$99/mo</Badge>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Unlimited tasks",
                  "Priority processing",
                  "Email outreach",
                  "Web research",
                  "Storefront builder",
                  "Marketing engine",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="text-brand-400">✦</span> {feat}
                  </div>
                ))}
              </div>

              {/* ===== THREE POST-TRIAL OPTIONS ===== */}
              {/* Option 1: Upgrade Monthly (existing CTA) */}
              <Button className="w-full py-5 text-sm font-bold bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-xl shadow-lg shadow-brand-500/20 transition-all">
                <Zap className="h-5 w-5 mr-2" /> Upgrade to Pro — $99/mo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {/* Option 2: Purchase One-Time Credits */}
              <Button onClick={() => setShowCreditPurchase(true)}
                variant="outline"
                className="w-full py-4 text-xs font-bold border-slate-700 hover:border-brand-500/50 hover:text-brand-400 transition-all">
                <ShoppingCart className="h-4 w-4 mr-2" /> Purchase One-Time Credits
                <span className="ml-auto text-[9px] text-slate-500">No subscription</span>
              </Button>

              {/* Option 3: Continue Free */}
              <button onClick={onClose}
                className="w-full py-3 text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5">
                <LogIn className="h-3.5 w-3.5" /> Continue with remaining free features
              </button>

              <p className="text-[10px] text-center text-slate-600">
                30-day money-back guarantee. Cancel anytime.
              </p>
            </div>

            {/* Close button */}
            <button onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </Card>
        </div>
      </div>

      {/* Credit Purchase Modal */}
      <CreditPurchase
        open={showCreditPurchase}
        onClose={() => setShowCreditPurchase(false)}
      />
    </>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${className || ""}`}>
      {children}
    </span>
  );
}