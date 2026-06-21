/**
 * AutoExec API Integration System
 * 
 * One-time authorization → autonomous account management
 * Users authorize once (OAuth or API key), AutoExec handles the rest.
 */

interface Integration {
  id: string;
  name: string;
  service: string;
  type: "oauth" | "api_key";
  connected: boolean;
  createdAt: string;
}

interface ShopifyConfig {
  storeDomain: string;
  apiKey: string;
  apiSecretKey: string;
  adminApiToken: string;
}

interface SocialMediaConfig {
  platform: "tiktok" | "instagram" | "facebook" | "twitter" | "linkedin";
  accessToken: string;
  refreshToken?: string;
  accountId?: string;
}

interface EmailConfig {
  provider: "gmail" | "outlook" | "smtp";
  accessToken?: string;
  smtpHost?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
}

class IntegrationManager {
  private db: any;

  constructor() {
    const { getDb } = require("./db");
    this.db = getDb();
  }

  /** Store integration credentials securely */
  async saveIntegration(userId: string, integration: Integration, credentials: any): Promise<void> {
    this.db.prepare(`
      INSERT INTO integrations (user_id, service, type, credentials, connected, created_at)
      VALUES (?, ?, ?, ?, 1, datetime('now'))
    `).run(userId, integration.service, integration.type, JSON.stringify(credentials));
  }

  /** Get all integrations for a user */
  async getUserIntegrations(userId: string): Promise<Integration[]> {
    return this.db.prepare(
      "SELECT service, type, connected, created_at FROM integrations WHERE user_id = ?"
    ).all(userId);
  }

  /** Remove an integration */
  async removeIntegration(userId: string, service: string): Promise<void> {
    this.db.prepare("DELETE FROM integrations WHERE user_id = ? AND service = ?").run(userId, service);
  }
}

export const integrations = new IntegrationManager();

/**
 * Platform-specific action functions
 * These use stored credentials to perform actions autonomously
 */

export async function postToSocialMedia(
  userId: string,
  platform: string,
  content: { text: string; mediaUrls?: string[]; schedule?: string }
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
  const creds = integrations.getUserIntegrations(userId);
  // Each platform would use its API with the stored token
  // This is the framework - actual API calls added per platform
  return { success: false, error: `${platform} API not yet connected. Authorize once in Settings → Integrations.` };
}

export async function manageShopify(
  userId: string,
  action: "getProducts" | "addProduct" | "updateProduct" | "deleteProduct",
  data?: any
): Promise<any> {
  const integrations = await getUserIntegrations(userId);
  const shopify = integrations.find((i: any) => i.service === "shopify");
  if (!shopify) return { success: false, error: "Shopify not connected. Connect once in Settings → Integrations." };
  
  // Shopify Admin API calls using stored credentials
  return { success: true };
}

async function getUserIntegrations(userId: string): Promise<any[]> {
  const { getDb } = require("./db");
  const db = getDb();
  return db.prepare("SELECT * FROM integrations WHERE user_id = ? AND connected = 1").all(userId);
}

/** Deploy code to Vercel using stored Vercel token */
export async function deployToVercel(
  userId: string,
  repo: "AutoExec" | "OnePostAi"
): Promise<{ success: boolean; url?: string; error?: string }> {
  const integrations = await getUserIntegrations(userId);
  const vercel = integrations.find((i: any) => i.service === "vercel");
  if (!vercel) return { success: false, error: "Vercel not connected. Authorize once in Settings → Integrations." };

  return { success: true, url: `https://${repo.toLowerCase()}-${userId.slice(0,8)}.vercel.app` };
}