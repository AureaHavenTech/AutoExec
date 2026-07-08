/**
 * Axel AI — Brand Foundation Config
 *
 * Single source of truth for brand identity across the app.
 * Import this instead of hardcoding brand values.
 *
 * © 2026 Aura Haven Tech. All rights reserved.
 */

export const brand = {
  /** Brand identity */
  name: "Axel AI",
  nameLegal: "Axel AI™",
  tagline: "Tell it what to do. It does the rest.",
  nameMeaning:
    "Just like an axle keeps your car moving, Axel AI keeps your business running — your personal assistant that drives everything forward.",
  description:
    "Your autonomous AI executive assistant. Describe any task in plain language — research, email outreach, webpages, data gathering, content, analytics — and it executes end-to-end.",

  /** Vibe & personality */
  vibe: "Modern, high-end, smart, cutting-edge, savvy — neutral",
  emotion: "Authoritative, polished, reliable, premium executive assistant",
  promise:
    "One AI employee that works 24/7 across all your ventures — researches, writes, emails, builds, analyzes",

  /** Logo — steering wheel icon in gold on dark gray circle + AXEL AI wordmark */
  logo: {
    /** Path to the steering wheel icon / logo mark */
    iconPath: "/favicon.svg",
    alt: "Axel AI — Steering Wheel Mark",
    /** Full wordmark with icon */
    wordmark: "AXEL AI",
  },

  /** Color palette — LOCKED (shared family with OnePost AI & Aura Haven) */
  colors: {
    dark: {
      DEFAULT: "#12121a",
      deeper: "#0a0a0f",
      border: "#1e1e2a",
      card: "rgba(10,10,15,0.4)",
    },
    cream: {
      DEFAULT: "#e8e0d4",
      light: "#f5f0eb",
    },
    gold: {
      DEFAULT: "#c9a96e",
      light: "#d4b87a",
      lighter: "#e8d4a8",
      accent: "#c9a96e",
      gradient: "linear-gradient(135deg, #c9a96e, #d4b87a, #e8d4a8)",
    },
    emerald: {
      DEFAULT: "#10b981",
      light: "#34d399",
      usage: "Trust signals, guarantees (30-day money-back)",
    },
  },

  /** Typography — LOCKED */
  fonts: {
    heading: {
      family: "'Playfair Display', Georgia, serif",
      description: "Serif, elegant, premium",
    },
    body: {
      family: "'Inter', system-ui, -apple-system, sans-serif",
      description: "Clean, modern, readable",
    },
  },

  /** Parent company */
  parent: {
    name: "Aura Haven Tech",
    email: "aurahaventech@gmail.com",
    copyright: "© 2026 Aura Haven Tech. All rights reserved.",
  },

  /** Social links */
  socials: {
    handle: "@funkycoldmedemaa",
    instagram: "https://instagram.com/funkycoldmedemaa",
    tiktok: "https://tiktok.com/@funkycoldmedemaa",
    facebook: "https://facebook.com/funkycoldmedemaa",
    pinterest: "https://pinterest.com/funkycoldmedemaa",
    snapchat: "https://snapchat.com/add/funkycoldmedemaa",
  },

  /** URLs */
  urls: {
    app: "https://axelai-eight.vercel.app",
    /** Cross-promotion to sibling brands */
    onePostAI: "https://onepostai.vercel.app",
    auraHaven: "https://aurbhaven.shop",
  },

  /** Pricing tiers */
  pricing: [
    { name: "Starter", price: 39, features: ["50 tasks/mo", "Basic research", "Email outreach"] },
    { name: "Pro", price: 99, features: ["200 tasks/mo", "Full web research", "Send emails", "Strategy generation"] },
    { name: "Unlimited", price: 249, features: ["No task cap", "Priority processing", "All features"] },
  ],

  /** Affiliate program */
  affiliate: {
    commission: 0.1, // 10%
    description: "10% commission per sale with custom referral links",
  },

  /** Guarantee */
  guarantee: "30-day money-back guarantee",
} as const;

export default brand;