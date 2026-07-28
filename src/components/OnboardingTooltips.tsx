"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "onboarding_completed";

interface TooltipStep {
  id: string;
  title: string;
  description: string;
  selector?: string;
}

interface OnboardingTooltipsProps {
  appName?: "axel" | "onepost";
  steps?: TooltipStep[];
}

const DEFAULT_STEPS_AXEL: TooltipStep[] = [
  {
    id: "dashboard",
    title: "This is your dashboard",
    description: "Your command center — view tasks, analytics, and recent activity all in one place.",
  },
  {
    id: "chat",
    title: "Ask Axel anything here",
    description: "Type any task in plain language. Axel researches, writes, emails, and builds for you 24/7.",
  },
  {
    id: "settings",
    title: "Your settings are here",
    description: "Customize your experience, connect integrations, and manage your account.",
  },
];

const DEFAULT_STEPS_ONEPOST: TooltipStep[] = [
  {
    id: "dashboard",
    title: "This is your dashboard",
    description: "View your content calendar, scheduled posts, and performance analytics.",
  },
  {
    id: "create",
    title: "Create content here",
    description: "Drop a raw idea or video — AI turns it into polished posts for every platform.",
  },
  {
    id: "settings",
    title: "Your settings are here",
    description: "Connect social accounts, customize your brand profile, and manage billing.",
  },
];

export default function OnboardingTooltips({ appName = "axel", steps: customSteps }: OnboardingTooltipsProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = customSteps || (appName === "onepost" ? DEFAULT_STEPS_ONEPOST : DEFAULT_STEPS_AXEL);

  useEffect(() => {
    // Only show for logged-in users on dashboard
    const isDashboard = window.location.pathname.includes("dashboard");
    if (!isDashboard) return;

    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed) return;

    // Delay a bit for the page to render
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      finish();
    }
  }, [currentStep, steps.length]);

  const back = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const finish = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  if (!visible) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={finish} />

      {/* Tooltip card */}
      <div className="relative z-10 mx-4 w-full max-w-sm animate-slide-up rounded-2xl border border-[#c9a96e]/30 bg-[#1a1a24] p-6 shadow-2xl">
        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep ? "w-6 bg-[#c9a96e]" : "w-1.5 bg-[#e8e0d4]/20"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a96e]/20 to-[#c9a96e]/5 mb-3">
            <span className="text-xl">👋</span>
          </div>
          <h3 className="text-lg font-semibold text-[#e8e0d4] font-serif">{step.title}</h3>
          <p className="mt-1 text-sm text-[#e8e0d4]/60">{step.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={back}
            disabled={isFirst}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              isFirst
                ? "text-[#e8e0d4]/15 cursor-not-allowed"
                : "text-[#e8e0d4]/50 hover:text-[#e8e0d4] hover:bg-[#e8e0d4]/5"
            }`}
          >
            ← Back
          </button>
          <span className="text-xs text-[#e8e0d4]/30">
            {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={isLast ? finish : next}
            className="rounded-lg bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] px-4 py-1.5 text-xs font-semibold text-[#12121a] transition-opacity hover:opacity-90"
          >
            {isLast ? "Got it!" : "Next →"}
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={finish}
          className="mt-3 w-full text-center text-xs text-[#e8e0d4]/20 hover:text-[#e8e0d4]/40 transition-colors"
        >
          Skip tutorial
        </button>
      </div>
    </div>
  );
}
