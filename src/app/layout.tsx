import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/json-ld";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  title: "Axel AI — The Axle That Drives Your Business",
  description: "Just like an axle keeps your car moving, Axel AI keeps your business running. Describe any task in plain language — it researches, writes, builds, emails, and analyzes for you 24/7.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Axel AI",
  },
  openGraph: {
    title: "Axel AI — Tell it what to do. It does the rest.",
    description: "Your intelligent business assistant. One AI assistant that works 24/7 across all your ventures — organizes, drafts, plans, analyzes.",
    type: "website",
    url: "https://axelai-eight.vercel.app",
    siteName: "Axel AI",
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "Axel AI — The Axle That Drives Your Business" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Axel AI — Tell it what to do. It does the rest.",
    description: "Your intelligent business assistant. One AI assistant that works 24/7 across all your ventures.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

import { NotificationProvider } from "@/components/ui/notifications";
import { OfflineBanner } from "@/components/ui/offline-banner";
import InstallPrompt from "@/components/InstallPrompt";
import AnnouncementBar from "@/components/AnnouncementBar";
import EmailCapture from "@/components/EmailCapture";
import PushOptIn from "@/components/PushOptIn";
import OnboardingTooltips from "@/components/OnboardingTooltips";
import ThemeProvider from "@/components/theme-provider";
import KeyboardShortcuts from "@/components/keyboard-shortcuts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#12121a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Axel AI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Structured data */}
        <JsonLd />

        {/* Apple splash screens — all iOS device sizes */}
        <link rel="apple-touch-startup-image" href="/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1242x2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1170x2532.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1284x2778.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1290x2796.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1536x2048.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash-1668x2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash-2048x2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider>
          <KeyboardShortcuts />
          <AnnouncementBar appName="axel" />
        <OfflineBanner />
        {/* Skip-to-content for keyboard/accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded-lg focus:outline-none">
          Skip to content
        </a>
        <div id="main-content">
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </div>
        <EmailCapture appName="axel" />
        <PushOptIn />
        <OnboardingTooltips appName="axel" />
        <InstallPrompt />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered:', registration.scope);
                    },
                    function(err) {
                      console.log('SW registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
