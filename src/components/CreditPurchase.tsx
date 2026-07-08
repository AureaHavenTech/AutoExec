"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Zap, CheckCircle2, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { CREDIT_PACKS, CREDIT_BUNDLES, getCreditBalance, purchaseCreditPack, purchaseBundle, getCreditSummary, CreditType } from "@/lib/credits";

interface CreditPurchaseProps {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}

export function CreditPurchase({ open, onClose, onPurchased }: CreditPurchaseProps) {
  const [view, setView] = useState<"packs" | "bundles">("packs");
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<string | null>(null);
  const [balance, setBalance] = useState(getCreditBalance());
  const [showConfetti, setShowConfetti] = useState(false);

  // Refresh balance
  const refreshBalance = () => {
    setBalance(getCreditBalance());
  };

  useEffect(() => {
    if (open) refreshBalance();
  }, [open]);

  const handlePurchasePack = async (packId: CreditType) => {
    setPurchasing(packId);
    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 1200));
    purchaseCreditPack(packId);
    setPurchasing(null);
    setPurchased(packId);
    refreshBalance();
    onPurchased?.();
    setTimeout(() => setPurchased(null), 3000);
  };

  const handlePurchaseBundle = async (index: number) => {
    const label = CREDIT_BUNDLES[index].label;
    setPurchasing(`bundle_${index}`);
    await new Promise((r) => setTimeout(r, 1200));
    purchaseBundle(index);
    setPurchasing(null);
    setPurchased(label);
    refreshBalance();
    onPurchased?.();
    setTimeout(() => setPurchased(null), 3000);
  };

  if (!open) return null;

  const summary = getCreditSummary();
  const hasCredits = balance.premiumConversations > 0 || balance.additionalAutomations > 0 || balance.advancedActions > 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <Card className="p-0 overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-brand-500/10">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-500/20 via-slate-900 to-slate-900 p-5 text-center border-b border-slate-800">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-2 shadow-lg shadow-brand-500/20">
              <ShoppingCart className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-white">Get More Credits</h2>
            <p className="text-slate-400 text-xs mt-1">
              One-time credits — no subscription required
            </p>
          </div>

          {/* Balance bar */}
          {hasCredits && (
            <div className="px-5 py-3 bg-brand-500/5 border-b border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Your Balance</p>
              <div className="flex gap-3 flex-wrap">
                {summary.filter((s) => s.owned > 0).map((s) => (
                  <div key={s.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-xs">{s.icon}</span>
                    <span className="text-xs font-bold text-white">{s.owned}</span>
                    <span className="text-[9px] text-slate-500">{s.label.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Packs / Bundles */}
          <div className="flex items-center gap-1 bg-slate-950/60 mx-5 mt-4 rounded-lg p-1 border border-slate-800">
            <button onClick={() => setView("packs")}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === "packs" ? "bg-brand-500/20 text-brand-400" : "text-slate-500 hover:text-slate-300"
              }`}>Individual Packs</button>
            <button onClick={() => setView("bundles")}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === "bundles" ? "bg-brand-500/20 text-brand-400" : "text-slate-500 hover:text-slate-300"
              }`}>Bundles (Save More)</button>
          </div>

          <div className="p-5 space-y-3">
            {view === "packs" ? (
              /* Individual credit packs */
              CREDIT_PACKS.map((pack) => {
                const isPurchasing = purchasing === pack.id;
                const isPurchased = purchased === pack.id;
                return (
                  <div key={pack.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isPurchased
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg shrink-0">
                        {pack.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{pack.label}</p>
                        <p className="text-[10px] text-slate-500">{pack.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-extrabold text-white">${pack.price}</p>
                        <p className="text-[9px] text-slate-500">{pack.amount} units</p>
                      </div>
                    </div>
                    <Button onClick={() => handlePurchasePack(pack.id)}
                      disabled={isPurchasing || isPurchased}
                      className={`w-full mt-3 py-2.5 text-xs font-bold rounded-lg transition-all ${
                        isPurchased
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-brand-500 hover:bg-brand-600 text-slate-950"
                      }`}>
                      {isPurchasing ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Processing...</>
                      : isPurchased ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Purchased!</>
                      : <>Buy ${pack.price} — {pack.amount} {pack.label.split(" ")[0]}</>}
                    </Button>
                  </div>
                );
              })
            ) : (
              /* Bundle deals */
              CREDIT_BUNDLES.map((bundle, index) => {
                const isPurchasing = purchasing === `bundle_${index}`;
                const isPurchased = purchased === bundle.label;
                const totalRetail = Object.entries(bundle.packs).reduce((sum, [type, count]) => {
                  const pack = CREDIT_PACKS.find((p) => p.id === type);
                  return sum + (pack ? pack.price * count : 0);
                }, 0);

                return (
                  <div key={index}
                    className={`p-4 rounded-xl border transition-all ${
                      isPurchased
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : index === 2
                          ? "bg-brand-500/5 border-brand-500/30"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}>
                    {index === 2 && (
                      <div className="text-[9px] font-bold text-brand-400 uppercase tracking-widest mb-2">
                        ★ Best Value
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{bundle.label}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {Object.entries(bundle.packs).filter(([, count]) => count > 0).map(([type, count]) => {
                            const pack = CREDIT_PACKS.find((p) => p.id === type);
                            return pack ? (
                              <span key={type} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                {count}x {pack.label.split(" ")[0]}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-extrabold text-white">${bundle.price}</p>
                        <p className="text-[9px] text-brand-400 font-semibold">{bundle.discount}</p>
                        {totalRetail > bundle.price && (
                          <p className="text-[8px] text-slate-600 line-through">${totalRetail}</p>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => handlePurchaseBundle(index)}
                      disabled={isPurchasing || isPurchased}
                      className={`w-full mt-3 py-2.5 text-xs font-bold rounded-lg transition-all ${
                        isPurchased
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : index === 2
                            ? "bg-brand-500 hover:bg-brand-600 text-slate-950 shadow-lg shadow-brand-500/20"
                            : "bg-slate-800 hover:bg-slate-700 text-white"
                      }`}>
                      {isPurchasing ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Processing...</>
                      : isPurchased ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Purchased!</>
                      : <>Buy ${bundle.price} — {bundle.label}</>}
                    </Button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
            <button onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Skip for now
            </button>
            <p className="text-[9px] text-slate-600">
              Credits never expire. Secure checkout.
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
  );
}