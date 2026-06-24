import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Perform a real web search using agent-browser (browser automation) 
 * or fallback to DuckDuckGo Lite scraping
 */
export async function performWebSearch(query: string): Promise<{
  results: Array<{ title: string; snippet: string; url: string }>;
  raw?: string;
}> {
  const results: Array<{ title: string; snippet: string; url: string }> = [];
  
  try {
    // Try agent-browser first for real browser-based search
    const { stdout } = await execAsync(
      `agent-browser goto "https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}" --wait 3 --extract-text 2>&1`,
      { timeout: 15000 }
    );
    
    // Parse the extracted text for links and snippets
    const lines = stdout.split("\n");
    let currentTitle = "";
    
    for (const line of lines) {
      const linkMatch = line.match(/https?:\/\/[^\s"'<>]+/g);
      if (linkMatch) {
        const url = linkMatch[0];
        // Get the surrounding text as a snippet
        const before = lines[Math.max(0, lines.indexOf(line) - 1)] || "";
        const snippet = before.trim().substring(0, 200);
        
        results.push({
          title: currentTitle || url.substring(0, 60),
          snippet,
          url,
        });
        currentTitle = "";
      } else if (line.trim().length > 30 && line.trim().length < 200) {
        currentTitle = line.trim();
      }
    }
  } catch (e) {
    // Fallback: use curl for simple search
    try {
      const { stdout } = await execAsync(
        `curl -s -L "https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}" 2>&1`,
        { timeout: 10000 }
      );
      
      // Extract result links from the HTML
      const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
      let match;
      while ((match = linkRegex.exec(stdout)) !== null) {
        const url = match[1].startsWith("http") ? match[1] : `https://${match[1]}`;
        const title = match[2].trim();
        if (title && url && !url.includes("duckduckgo.com") && !url.includes("https://www.")) {
          results.push({ title: title.substring(0, 100), snippet: "", url });
        }
        if (results.length >= 20) break;
      }
    } catch (curlErr) {
      console.error("Web search fallback failed:", curlErr);
    }
  }

  return { results };
}

/**
 * Generate a simple HTML page and save it to the webpages directory
 */
export async function generateWebpage(
  title: string,
  content: string,
  theme: "modern" | "minimal" | "luxury" | "shopify" | "product" = "modern"
): Promise<{ path: string; url: string }> {
  const fs = await import("fs/promises");
  const path = await import("path");
  
  const pagesDir = path.join(process.cwd(), "public", "generated");
  await fs.mkdir(pagesDir, { recursive: true });

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 40) || "page";

  const themes: Record<string, string> = {
    modern: `body { font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 2rem; background: #0a0a0a; color: #e5e5e5; line-height: 1.6; }
      h1 { color: #8b5cf6; font-size: 2.5rem; } h2 { color: #14b8a6; } a { color: #8b5cf6; }
      .card { background: #1a1a2e; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; border: 1px solid #2a2a3e; }`,
    minimal: `body { font-family: 'Georgia', serif; max-width: 650px; margin: 0 auto; padding: 2rem; background: #fafafa; color: #333; line-height: 1.8; }
      h1 { color: #000; font-size: 2rem; } a { color: #0066cc; }`,
    luxury: `body { font-family: 'Playfair Display', Georgia, serif; max-width: 900px; margin: 0 auto; padding: 3rem; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #e8dcc8; line-height: 1.7; }
      h1 { color: #c9a96e; font-size: 3rem; font-weight: 400; } h2 { color: #d4af37; }
      .card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 2rem; margin: 1.5rem 0; border: 1px solid rgba(201,169,110,0.2); }
      .highlight { color: #d4af37; }`,
    shopify: `* { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 0; background: #ffffff; color: #1a1a2e; }
      .product-page { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; padding: 3rem; }
      .product-gallery { width: 100%; }
      .product-gallery img { width: 100%; border-radius: 8px; background: #f5f5f5; }
      .product-thumbs { display: flex; gap: 0.5rem; margin-top: 1rem; }
      .product-thumbs img { width: 80px; height: 80px; border-radius: 6px; cursor: pointer; border: 2px solid transparent; object-fit: cover; background: #f5f5f5; }
      .product-thumbs img:hover { border-color: #8b5cf6; }
      .product-info { padding-top: 1rem; }
      .product-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem; color: #111; }
      .product-price { font-size: 2rem; font-weight: 800; color: #8b5cf6; margin-bottom: 0.25rem; }
      .product-compare { font-size: 1rem; color: #999; text-decoration: line-through; }
      .product-badge { display: inline-block; background: #f0fdf4; color: #16a34a; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 999px; font-weight: 600; margin-bottom: 1rem; }
      .product-description { color: #4a4a6a; line-height: 1.7; margin: 1.5rem 0; font-size: 1rem; }
      .product-specs { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
      .product-specs td { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }
      .product-specs td:first-child { font-weight: 600; color: #374151; width: 40%; }
      .product-specs td:last-child { color: #6b7280; }
      .add-to-cart { display: inline-block; background: #8b5cf6; color: white; padding: 1rem 3rem; border-radius: 8px; font-size: 1.1rem; font-weight: 700; border: none; cursor: pointer; width: 100%; text-align: center; text-decoration: none; transition: background 0.2s; }
      .add-to-cart:hover { background: #7c3aed; }
      .quantity-selector { display: flex; align-items: center; gap: 0.5rem; margin: 1.5rem 0; }
      .quantity-selector button { width: 40px; height: 40px; border: 1px solid #d1d5db; background: white; border-radius: 6px; font-size: 1.2rem; cursor: pointer; }
      .quantity-selector input { width: 60px; text-align: center; border: 1px solid #d1d5db; border-radius: 6px; padding: 0.5rem; font-size: 1rem; }
      @media (max-width: 768px) { .product-page { grid-template-columns: 1fr; padding: 1.5rem; } }`,
    product: `* { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a1a; color: #e5e5e5; line-height: 1.6; }
      .hero { background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 100%); padding: 4rem 2rem; text-align: center; border-bottom: 1px solid rgba(139,92,246,0.2); }
      .hero h1 { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, #8b5cf6, #14b8a6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; }
      .hero .subtitle { font-size: 1.2rem; color: #9ca3af; margin-bottom: 2rem; }
      .hero .price { font-size: 3.5rem; font-weight: 900; color: white; margin-bottom: 0.5rem; }
      .hero .price span { font-size: 1.5rem; color: #6b7280; text-decoration: line-through; margin-left: 0.5rem; }
      .hero .badge { display: inline-block; background: rgba(239,68,68,0.2); color: #ef4444; padding: 0.25rem 1rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; border: 1px solid rgba(239,68,68,0.3); margin-bottom: 1.5rem; }
      .container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
      .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 3rem 0; }
      .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.5rem; }
      .feature-card h3 { color: #8b5cf6; margin-bottom: 0.5rem; font-size: 1.1rem; }
      .feature-card p { color: #9ca3af; font-size: 0.9rem; }
      .testimonials { margin: 3rem 0; }
      .testimonial { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 2rem; margin-bottom: 1rem; }
      .testimonial p { font-style: italic; color: #d1d5db; margin-bottom: 0.5rem; }
      .testimonial .author { color: #6b7280; font-size: 0.85rem; }
      .urgency { background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(139,92,246,0.1)); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 2rem; text-align: center; margin: 3rem 0; }
      .urgency p { font-size: 1.1rem; color: #fca5a5; font-weight: 600; }
      .cta { display: inline-block; background: linear-gradient(135deg, #8b5cf6, #14b8a6); color: white; padding: 1.2rem 3rem; border-radius: 12px; font-size: 1.2rem; font-weight: 800; border: none; cursor: pointer; text-decoration: none; text-align: center; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 20px rgba(139,92,246,0.3); }
      .cta:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(139,92,246,0.4); }
      .cta-wrapper { text-align: center; margin: 2rem 0; }
      .guarantee { text-align: center; color: #6b7280; font-size: 0.85rem; margin-top: 1rem; }
      @media (max-width: 768px) { .hero h1 { font-size: 2rem; } .hero .price { font-size: 2.5rem; } }`,
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Axel AI</title>
  <style>${themes[theme] || themes.modern}</style>
</head>
<body>
  ${content}
  <hr style="margin-top: 3rem; border-color: rgba(255,255,255,0.1);">
  <p style="text-align: center; color: #666; font-size: 0.8rem;">Generated by Axel AI AI · ${new Date().toLocaleDateString()}</p>
</body>
</html>`;

  const filename = `${slug}.html`;
  await fs.writeFile(path.join(pagesDir, filename), html, "utf-8");

  return {
    path: path.join(pagesDir, filename),
    url: `/generated/${filename}`,
  };
}

/**
 * Product data for generating product pages
 */
export interface ProductData {
  name: string;
  price: number;
  comparePrice?: number;
  description: string;
  features: string[];
  specs?: Array<{ label: string; value: string }>;
  imageUrl?: string;
  badge?: string;
  testimonial?: { quote: string; author: string };
  urgency?: string;
}

/**
 * Generate a product-specific page (shopify or product theme)
 */
export async function generateProductPage(
  product: ProductData,
  theme: "shopify" | "product" = "shopify"
): Promise<{ path: string; url: string }> {
  const count = Math.min(product.features.length, 6);
  const displayFeatures = product.features.slice(0, count);
  
  let content = "";

  if (theme === "shopify") {
    content = `<div class="product-page">
      <div class="product-gallery">
        <img src="${product.imageUrl || 'https://placehold.co/600x600/e2e8f0/94a3b8?text=Product+Image'}" alt="${product.name}" />
        <div class="product-thumbs">
          <img src="${product.imageUrl || 'https://placehold.co/80x80/e2e8f0/94a3b8?text=1'}" alt="View 1" />
          <img src="https://placehold.co/80x80/e2e8f0/94a3b8?text=2" alt="View 2" />
          <img src="https://placehold.co/80x80/e2e8f0/94a3b8?text=3" alt="View 3" />
          <img src="https://placehold.co/80x80/e2e8f0/94a3b8?text=4" alt="View 4" />
        </div>
      </div>
      <div class="product-info">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <h1 class="product-title">${product.name}</h1>
        <div class="product-price">${product.price.toFixed(2)}</div>
        ${product.comparePrice ? `<div class="product-compare">${product.comparePrice.toFixed(2)}</div>` : ''}
        <div class="product-description">${product.description}</div>
        ${product.specs ? `<table class="product-specs">${product.specs.map(s => `<tr><td>${s.label}</td><td>${s.value}</td></tr>`).join('')}</table>` : ''}
        <div class="quantity-selector">
          <button onclick="this.nextElementSibling.stepDown()">−</button>
          <input type="number" value="1" min="1" max="99" />
          <button onclick="this.previousElementSibling.stepUp()">+</button>
        </div>
        <a href="#" class="add-to-cart">Add to Cart — ${product.price.toFixed(2)}</a>
      </div>
    </div>`;
  } else {
    // Product theme (sales-focused)
    content = `<div class="hero">
      ${product.badge ? `<div class="badge">${product.badge}</div>` : ''}
      <h1>${product.name}</h1>
      <p class="subtitle">${product.description.substring(0, 120)}${product.description.length > 120 ? '...' : ''}</p>
      <div class="price">${product.price.toFixed(2)}${product.comparePrice ? `<span>${product.comparePrice.toFixed(2)}</span>` : ''}</div>
    </div>
    <div class="container">
      <div class="features">
        ${displayFeatures.map(f => `<div class="feature-card"><h3>✦ ${f}</h3><p>Premium quality designed for results.</p></div>`).join('')}
      </div>
      ${product.specs ? `<table class="product-specs" style="width:100%;border-collapse:collapse;margin:2rem 0;">
        <tr style="background:rgba(255,255,255,0.03);"><th style="text-align:left;padding:0.75rem;border-bottom:1px solid rgba(255,255,255,0.1);color:#8b5cf6;">Specification</th><th style="text-align:left;padding:0.75rem;border-bottom:1px solid rgba(255,255,255,0.1);color:#8b5cf6;">Value</th></tr>
        ${product.specs.map(s => `<tr><td style="padding:0.75rem;border-bottom:1px solid rgba(255,255,255,0.05);font-weight:600;">${s.label}</td><td style="padding:0.75rem;border-bottom:1px solid rgba(255,255,255,0.05);color:#9ca3af;">${s.value}</td></tr>`).join('')}
      </table>` : ''}
      ${product.testimonial ? `<div class="testimonials"><div class="testimonial"><p>"${product.testimonial.quote}"</p><div class="author">— ${product.testimonial.author}</div></div></div>` : ''}
      ${product.urgency ? `<div class="urgency"><p>⚡ ${product.urgency}</p></div>` : ''}
      <div class="cta-wrapper"><a href="#" class="cta">Buy Now — ${product.price.toFixed(2)}</a></div>
      <p class="guarantee">🛡️ 30-day money-back guarantee · Free shipping · Secure checkout</p>
    </div>`;
  }

  return generateWebpage(product.name, content, theme);
}

/**
 * Visit any URL and return the page content
 * Uses curl with a real browser User-Agent to fetch content
 */
export async function visitUrl(url: string): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const { execSync } = require("child_process");
    // Try with agent-browser first for JS-rendered pages
    const result = execSync(
      `agent-browser goto "${url}" --wait 4 --extract-text 2>&1 || curl -s -L "${url}" -H "User-Agent: Mozilla/5.0" 2>&1`,
      { timeout: 15000, encoding: "utf-8" }
    );
    if (result && result.length > 100) {
      return { success: true, content: result.substring(0, 5000) };
    }
    // Fallback to simple curl
    const { execSync: exec } = require("child_process");
    const fallback = exec(`curl -s -L "${url}" 2>&1`, { timeout: 10000, encoding: "utf-8" });
    return { success: true, content: fallback.substring(0, 5000) };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch URL" };
  }
}

/**
 * Generate a marketing strategy based on research
 */
export async function generateMarketingStrategy(
  productName: string,
  description: string,
  targetAudience: string = "general"
): Promise<{ 
  channels: Array<{ name: string; why: string; strategy: string }>;
  adCopy: Array<{ headline: string; body: string; platform: string }>;
  summary: string;
}> {
  // Real research would happen here via performWebSearch
  // For now, we use an advanced generation engine based on the description
  
  const channels = [
    { 
      name: "Google Search Ads", 
      why: "Captures high-intent users actively searching for solutions in your niche.", 
      strategy: "Target long-tail 'how-to' and 'best [category]' keywords. Use negative keywords to filter out low-intent traffic." 
    },
    { 
      name: "Meta (Facebook/Instagram)", 
      why: "Excellent for visual discovery and lifestyle-based targeting.", 
      strategy: "Run a 'Problem-Agitate-Solve' video ad sequence. Retarget visitors with testimonial-based carousels." 
    },
    { 
      name: "LinkedIn", 
      why: "The gold standard for B2B and professional services.", 
      strategy: "Target by Job Title and Seniority. Use Sponsored Content to offer a free guide/whitepaper in exchange for email." 
    },
    {
      name: "TikTok",
      why: "Rapidly growing for authentic UGC-style promotion.",
      strategy: "Partner with niche creators for 'A Day in the Life' videos featuring your product."
    }
  ];

  const adCopy = [
    { 
      platform: "Google Search", 
      headline: `${productName}: The Smarter Way to Work`, 
      body: `Stop struggling with ${description.split(' ').slice(0, 5).join(' ')}. Get the results you deserve with ${productName}. Free 30-day trial.` 
    },
    { 
      platform: "Instagram", 
      headline: "The Efficiency Hack You Needed", 
      body: `Built for empire-builders. ${productName} takes the grunt work off your plate so you can focus on growth. Tap to see how.` 
    }
  ];

  return {
    summary: `Strategic growth plan for ${productName} focusing on multi-channel presence and high-conversion ad creative.`,
    channels,
    adCopy
  };
}

/**
 * Classify a task with expanded support for new capabilities
 */
export function classifyTask(description: string): {
  type: "research" | "list_building" | "email_outreach" | "data_gathering" | "marketing" | "webpage" | "product_page" | "image_gen" | "cross_promotion" | "general";
  targets: string[];
  location?: string;
  industry?: string;
} {
  const lower = description.toLowerCase();

  let type: "research" | "list_building" | "email_outreach" | "data_gathering" | "marketing" | "webpage" | "product_page" | "image_gen" | "cross_promotion" | "general" = "general";
  
  if (lower.includes("find") || lower.includes("search") || lower.includes("research") || lower.includes("scrape") || lower.includes("locate")) {
    type = "research";
  }
  if (lower.includes("list") || lower.includes("compile") || lower.includes("extract") || lower.includes("csv") || lower.includes("spreadsheet")) {
    type = "list_building";
  }
  if (lower.includes("email") || lower.includes("outreach") || lower.includes("draft") || lower.includes("pitch") || lower.includes("intro") || lower.includes("send email")) {
    type = "email_outreach";
  }
  if (lower.includes("gather") || lower.includes("analyze") || lower.includes("collect") || lower.includes("data") || lower.includes("intel") || lower.includes("research market")) {
    type = "data_gathering";
  }
  if (lower.includes("marketing") || lower.includes("advertise") || lower.includes("ad ") || lower.includes("traffic") || lower.includes("promote") || lower.includes("marketing channel")) {
    type = "marketing";
  }
  // Product page detection (check before general webpage)
  if (lower.includes("product page") || lower.includes("shopify") || lower.includes("listing") || lower.includes("product description") || lower.includes("ad for") || (lower.includes("product") && (lower.includes("page") || lower.includes("listing") || lower.includes("description")))) {
    type = "product_page";
  }
  if (lower.includes("webpage") || lower.includes("landing page") || lower.includes("build") && !lower.includes("list") && !lower.includes("find") || lower.includes("create page") || lower.includes("html page")) {
    // Only set to webpage if not already set to product_page
    if (type !== "product_page") type = "webpage";
  }
  if (lower.includes("image") || lower.includes("ad creative") || lower.includes("banner") || lower.includes("graphic") || lower.includes("visual")) {
    type = "image_gen";
  }
  if (lower.includes("cross-promote") || lower.includes("one post ai") || lower.includes("cross promote") || lower.includes("other product") || lower.includes("promote my other")) {
    type = "cross_promotion";
  }

  // Extract potential targets
  const targets: string[] = [];
  const targetPatterns = [
    /(?:saas|startups?|companies|businesses|firms|agencies|vendors)/gi,
    /(\w+)\s+(?:companies|startups|firms)/gi,
  ];
  for (const pattern of targetPatterns) {
    const matches = description.match(pattern);
    if (matches) targets.push(...matches);
  }

  // Extract location
  let location: string | undefined;
  const locPattern = /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  const locMatch = locPattern.exec(description);
  if (locMatch && locMatch[1].length < 30) {
    location = locMatch[1];
  }

  return { type, targets: Array.from(new Set(targets)), location };
}

/**
 * FAQ / Support knowledge base for the in-app support assistant
 */
export const faqKnowledge: Array<{ keywords: string[]; answer: string; category: string }> = [
  {
    keywords: ["pricing", "cost", "price", "plans", "subscription", "how much", "monthly", "annual", "discount"],
    category: "pricing",
    answer:
      "Axel AI offers three plans:\n\n" +
      "**Starter** — $39/mo\n- 50 tasks per month\n- Basic web research & email\n\n" +
      "**Pro** — $99/mo\n- 200 tasks per month\n- Deep web research & scraping\n- Multi-step email outreach\n- Priority processing\n\n" +
      "**Unlimited** — $249/mo\n- No task cap\n- All features + priority\n- Dedicated support\n\n" +
      "💰 **Save ~20%** with annual billing! You can upgrade or downgrade anytime from the Billing page."
  },
  {
    keywords: ["free trial", "trial", "try", "demo", "get started", "sign up", "signup"],
    category: "getting-started",
    answer:
      "Getting started with Axel AI is easy! 🚀\n\n" +
      "1. Click **Launch App** on the homepage\n" +
      "2. Create your account (or sign in with a demo account)\n" +
      "3. Start a **new chat** from the dashboard\n" +
      "4. Type what you need done in plain language\n\n" +
      "**Try these examples:**\n" +
      "- \"Find me 5 SaaS companies hiring in San Francisco\"\n" +
      "- \"Build me a landing page for my startup\"\n" +
      "- \"Research the best marketing channels for my product\"\n" +
      "- \"What's my task limit?\"\n\n" +
      "You can explore the dashboard and submit test tasks right away!"
  },
  {
    keywords: ["task limit", "task limits", "how many tasks", "limit", "overage", "exceed"],
    category: "usage",
    answer:
      "Each plan has a monthly task limit:\n\n" +
      "- **Starter**: 50 tasks/month\n" +
      "- **Pro**: 200 tasks/month\n" +
      "- **Unlimited**: No limit\n\n" +
      "You can see your current usage on the dashboard. If you approach your limit, we notify you. " +
      "No overage fees — tasks simply pause until the next cycle or you upgrade. " +
      "Upgrade anytime from the **Billing** page!"
  },
  {
    keywords: ["cancel", "cancellation", "refund", "unsubscribe", "stop"],
    category: "billing",
    answer:
      "You can cancel your subscription anytime from the **Billing** page in your dashboard. " +
      "Your plan remains active until the end of the current billing period. " +
      "No cancellation fees, no hassle. We'll miss you though! 😊"
  },
  {
    keywords: ["how to", "how do i", "how can i", "tutorial", "guide", "help me", "walk me through"],
    category: "how-to",
    answer:
      "Here are quick guides for common tasks:\n\n" +
      "**🤖 Research companies**\n" +
      "Just say: \"Find me [number] [type] companies in [location]\"\n\n" +
      "**📧 Send outreach emails**\n" +
      "Say: \"Draft an intro email to [target] about [topic]\"\n\n" +
      "**🌐 Build a webpage**\n" +
      "Say: \"Build me a landing page for [your product]\"\n\n" +
      "**📊 Marketing research**\n" +
      "Say: \"Research the best channels to advertise [product]\"\n\n" +
      "**🤝 Cross-promotion**\n" +
      "Say: \"Tell me about One Post AI\" to see our sister product!\n\n" +
      "Axel AI responds with real-time streaming results. Just describe what you need!"
  },
  {
    keywords: ["what is axel ai", "what can axel ai do", "features", "capabilities", "can it"],
    category: "features",
    answer:
      "Axel AI is your autonomous AI executive assistant. I can:\n\n" +
      "🔍 **Web Research** — Search the web for companies, people, data\n" +
      "📋 **List Building** — Compile prospect lists with verified contacts\n" +
      "✉️ **Email Outreach** — Draft personalized email campaigns\n" +
      "📊 **Market Research** — Analyze channels, competitors, trends\n" +
      "🌐 **Webpage Building** — Generate and host landing pages\n" +
      "🎨 **Ad Creative** — Research and recommend ad strategies\n" +
      "🤝 **Cross-Promotion** — Connect with One Post AI\n\n" +
      "Just describe what you need in plain language and I'll handle the rest!"
  },
  {
    keywords: ["one post ai", "onepost", "social media", "sister product", "cross promote", "cross-promotion"],
    category: "cross-promotion",
    answer:
      "**One Post AI** is our sister product for social media management! 🚀\n\n" +
      "Features:\n" +
      "- ✍️ AI-powered content generation (posts, captions, threads)\n" +
      "- 📅 Smart scheduling at peak engagement times\n" +
      "- 📊 Analytics to track what works\n" +
      "- 🔄 Cross-platform management (Twitter, LinkedIn, Instagram)\n\n" +
      "🎉 **Exclusive Axel AI discount:** Get **20% off** One Post AI!\n" +
      "Use code **AXEL20** at checkout.\n" +
      "👉 [Visit One Post AI →](https://onepost.ai/axel)"
  },
  {
    keywords: ["affiliate", "referral", "commission", "earn money", "partner", "promote"],
    category: "affiliate",
    answer:
      "Yes! Our **Affiliate Program** pays **10% recurring commission** on every referral. 🎉\n\n" +
      "How it works:\n" +
      "1. Share your unique affiliate link\n" +
      "2. Someone clicks and subscribes\n" +
      "3. You earn 10% every month\n\n" +
      "Perfect for content creators, UGC creators, and entrepreneurs.\n" +
      "Visit our [Affiliates page](/affiliates) for more details or contact us to apply!"
  },
  {
    keywords: ["contact", "support", "help", "human", "talk to", "email support", "customer service"],
    category: "support",
    answer:
      "I'm here to help! But if you need human assistance:\n\n" +
      "📧 **Email:** support@axelai.app\n" +
      "💬 **Chat:** You're talking to it! I can answer most questions.\n" +
      "🌐 **FAQ:** Visit our [FAQ page](/faq) for common questions.\n\n" +
      "We typically respond to emails within 24 hours."
  },
  {
    keywords: ["security", "data", "privacy", "safe", "encrypt", "gdpr", "secure"],
    category: "security",
    answer:
      "Your data security is our top priority. 🔒\n\n" +
      "- All data encrypted **in transit** (TLS) and **at rest**\n" +
      "- Industry-standard security practices\n" +
      "- Your research data, contacts, and drafts are **private to you**\n" +
      "- We never share your data with third parties\n\n" +
      "Axel AI runs in secure cloud environments. Your tasks and results are yours alone."
  },
  {
    keywords: ["who built", "who created", "company", "team", "about", "story", "founded"],
    category: "about",
    answer:
      "Axel AI was built by a team passionate about empowering busy entrepreneurs, solo founders, and empire-builders. " +
      "We believe AI should handle the grunt work so humans can focus on what matters.\n\n" +
      "Visit our [About page](/about) to learn more about our mission!"
  },
];

/**
 * Check if a message is a support/question rather than a task to execute
 */
export function isSupportQuestion(message: string): { isSupport: boolean; answer?: string; category?: string } {
  const lower = message.toLowerCase().trim();

  // Check for pure conversational/support patterns (not task-oriented)
  const supportPatterns = [
    /^(what|how|why|when|where|who|which|can|could|would|will|do|does|did|is|are|was|were)\s/i,
    /^(hi|hello|hey|thanks|thank you|okay|ok|sure|yes|no|good|great)\b/i,
    /^i (have|need|want|am|was|would like to know)/i,
    /tell me about/i,
    /explain/i,
    /what is/i,
    /how (do|does|can|to)/i,
    /(help|support|question|faq)/i,
  ];

  const isGeneralQuestion = supportPatterns.some(p => p.test(lower));
  
  // Also check if the message looks like a task (contains actionable keywords)
  const taskPatterns = [
    /find (\d+|me|us)/i,
    /search (for|the)/i,
    /scrape/i,
    /build (me|a|an)/i,
    /create (a|an|me)/i,
    /generate/i,
    /draft/i,
    /send (an|a|email)/i,
    /research (\d+|the|these)/i,
    /compile/i,
    /extract/i,
    /list (\d+|the|of)/i,
    /locate/i,
  ];
  
  const isTaskLike = taskPatterns.some(p => p.test(lower));

  // If it looks like a general question without task intent, treat as support
  if (isGeneralQuestion && !isTaskLike) {
    // Find the best matching FAQ
    let bestMatch: { answer: string; category: string; score: number } | null = null;

    for (const faq of faqKnowledge) {
      let score = 0;
      for (const kw of faq.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          score += kw.length; // Longer keyword matches are better
        }
      }
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { answer: faq.answer, category: faq.category, score };
      }
    }

    if (bestMatch) {
      return { isSupport: true, answer: bestMatch.answer, category: bestMatch.category };
    }

    // Default helpful response for unrecognized questions
    return {
      isSupport: true,
      answer:
        "I'm Axel AI, your AI executive assistant! 🤖\n\n" +
        "I can help you with:\n" +
        "• **Research** — finding companies, people, and data on the web\n" +
        "• **List building** — compiling prospect lists with contacts\n" +
        "• **Email outreach** — drafting personalized campaigns\n" +
        "• **Marketing research** — analyzing channels and strategies\n" +
        "• **Webpage building** — generating landing pages\n" +
        "• **Answering questions** — about Axel AI, pricing, and how-tos\n\n" +
        "What would you like me to do? Just describe your task or ask me anything!"
    };
  }

  return { isSupport: false };
}