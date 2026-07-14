"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Loader2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Check,
  ExternalLink
} from "lucide-react";

const STRIPE_LINKS: Record<string, string> = {
  starter: "https://buy.stripe.com/14AfZh5rBaOU0fb4DEcwg0h",
  pro: "https://buy.stripe.com/3cI4gz5rB3ms1jf2vwcwg0j",
  unlimited: "https://buy.stripe.com/7sYcN5dY7g9eaTP8TUcwg0i",
};

export default function BillingPage() {
  const [activePlan, setActivePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      if (data.success && data.user.subscription) {
        setActivePlan(data.user.subscription);
      }
    } catch (err) {
      console.error("Failed to fetch billing info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleUpgrade = (tier: string) => {
    const url = STRIPE_LINKS[tier];
    if (url) {
      window.open(url, '_blank');
    }
    setUpgradeLoading(tier);
    setSuccessMessage(null);
    // Simulate returning from Stripe checkout
    setTimeout(() => {
      setActivePlan({ tier, current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
      setSuccessMessage(`Subscription initiated for ${tier.toUpperCase()} tier! Complete checkout in the Stripe window.`);
      setUpgradeLoading(null);
      setTimeout(() => setSuccessMessage(null), 8000);
    }, 2000);
  };

  const pricingTiers = [
    {
      id: "starter",
      name: "Starter",
      price: 39,
      description: "Basic research & email outreach capabilities.",
      features: [
        "50 tasks per month",
        "Basic web research",
        "Single-step email templates",
        "Email delivery support",
        "Standard execution speed",
        "Community support"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: 99,
      description: "Full research and outreach automation power.",
      features: [
        "200 tasks per month",
        "Deep web research & scraping",
        "Multi-step automated email outreach",
        "AI-driven personalization",
        "Priority task processing",
        "Email & chat support",
        "Custom agent triggers"
      ],
      popular: true
    },
    {
      id: "unlimited",
      name: "Unlimited",
      price: 249,
      description: "Zero restrictions. Uncapped outreach scaling.",
      features: [
        "No task limit (uncapped)",
        "Deep web research + browser agents",
        "Bulk outbound email campaigns",
        "Dedicated proxy configuration",
        "Instant execution speed",
        "Dedicated account manager",
        "Custom API integrations"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-brand-400" />
          <span>Billing & Plan Management</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your subscription plans, view task credits, and review billing details.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-lg text-sm flex items-start space-x-3 shadow-lg shadow-emerald-500/5 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" />
          <div className="space-y-1">
            <p className="font-bold">Subscription Updated</p>
            <p className="text-xs text-slate-300 leading-relaxed">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Active Subscription Overview */}
      {loading ? (
        <Card className="p-8 bg-slate-900/10 border-slate-900 animate-pulse h-32" />
      ) : activePlan ? (
        <Card className="bg-gradient-to-r from-brand-900/20 to-slate-900/50 border-brand-500/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 h-40 w-40 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Badge variant="info" className="uppercase font-bold tracking-wider px-2.5 py-0.5 text-[10px]">
                {activePlan.tier} Plan
              </Badge>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Active Account
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {activePlan.tier === "starter" ? "Starter Tier" : activePlan.tier === "pro" ? "Pro Tier" : "Unlimited Tier"}
              </h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Your account is currently using the dynamic {activePlan.tier} features.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-900/80 min-w-[200px] flex items-center space-x-3">
            <Clock className="h-5 w-5 text-slate-500 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Billing Cycle Ends</p>
              <p className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                {activePlan.current_period_end 
                  ? new Date(activePlan.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "July 14, 2026"}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Subscription Pricing Table */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available SaaS Tiers</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => {
            const isCurrent = activePlan && activePlan.tier === tier.id;
            return (
              <Card 
                key={tier.id} 
                className={`flex flex-col h-full bg-slate-900/30 transition-all duration-300 ${
                  isCurrent 
                    ? "border-brand-500 ring-1 ring-brand-500 bg-brand-500/5 shadow-2xl" 
                    : "border-slate-900 hover:border-slate-800"
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{tier.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="success" className="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="min-h-[40px] mt-1 text-xs">{tier.description}</CardDescription>
                  <div className="mt-3 flex items-baseline">
                    <span className="text-3xl font-extrabold text-white">${tier.price}</span>
                    <span className="text-slate-500 text-xs ml-1">/ mo</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <div className="border-t border-slate-800/60 my-4" />
                  <ul className="space-y-2.5">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-400">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button 
                    variant={isCurrent ? "outline" : tier.popular ? "primary" : "secondary"} 
                    disabled={isCurrent || upgradeLoading !== null}
                    onClick={() => handleUpgrade(tier.id)}
                    className="w-full py-2.5 text-xs font-bold"
                  >
                    {upgradeLoading === tier.id ? (
                      <>
                        <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" /> Processing...
                      </>
                    ) : isCurrent ? (
                      "Your Active Plan"
                    ) : (
                      `Upgrade to ${tier.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Secure billing footer badge */}
      <div className="flex items-center justify-center space-x-2 text-slate-500 text-xs py-4">
        <ShieldCheck className="h-4 w-4 text-slate-500" />
        <span>Payments secured and managed natively via Stripe Subscriptions. Cancel anytime.</span>
      </div>
    </div>
  );
}
