/**
 * JSON-LD structured data for Axel AI.
 * Renders a <script type="application/ld+json"> tag with schema.org WebApplication markup.
 *
 * © 2026 Aura Haven Tech. All rights reserved.
 */

export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Axel AI",
    alternateName: "AxelAI",
    url: "https://axelai-eight.vercel.app",
    description:
      "Your intelligent business assistant. Describe what you need in plain language — task management, content drafting, research, planning, analytics — and it handles the heavy lifting.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "39.00",
      priceCurrency: "USD",
      description: "Starting at $39/month",
    },
    author: {
      "@type": "Organization",
      name: "Aura Haven Tech",
      url: "https://aurahaven.shop",
      email: "aurahaventech@gmail.com",
      sameAs: ["https://twitter.com/funkycoldmedemaa"],
    },
    browserRequirements: "Requires JavaScript",
    featureList: [
      "AI business assistant",
      "Task automation",
      "Content drafting",
      "Shopify integration",
      "Calendar management",
      "Business organizer",
      "Multi-step workflows",
    ].join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
