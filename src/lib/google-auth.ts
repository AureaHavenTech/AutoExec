/**
 * Google OAuth2 token management for Axel AI.
 * Handles token storage, refresh, and validation for Gmail API access.
 * 
 * In production, tokens should be stored in a database keyed by user ID.
 * For this implementation, tokens are stored in-memory (per-process)
 * and persisted to localStorage on the client side.
 */

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // epoch ms
  scope: string;
  token_type: string;
}

export interface GmailPermissions {
  canRead: boolean;
  canSend: boolean;
  canDraft: boolean;
}

// In-memory token store (keyed by a session/user identifier)
const tokenStore = new Map<string, GoogleTokens>();

/**
 * Generate the Google OAuth2 authorization URL.
 */
export function getGoogleAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID environment variable is not set");
  }

  const redirectUri = getRedirectUri();
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: crypto.randomUUID(),
  });

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  const tokens: GoogleTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    scope: data.scope || "",
    token_type: data.token_type || "Bearer",
  };

  // Store tokens
  const userId = "default"; // In production, use actual user ID
  tokenStore.set(userId, tokens);

  return tokens;
}

/**
 * Refresh an expired access token using the refresh token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await response.json();
  const tokens: GoogleTokens = {
    access_token: data.access_token,
    refresh_token: refreshToken,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    scope: data.scope || "",
    token_type: data.token_type || "Bearer",
  };

  const userId = "default";
  tokenStore.set(userId, tokens);
  return tokens;
}

/**
 * Get a valid access token, refreshing if necessary.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const userId = "default";
  const tokens = tokenStore.get(userId);
  
  if (!tokens) return null;

  // Check if token is expired or about to expire (within 5 minutes)
  if (Date.now() > tokens.expires_at - 5 * 60 * 1000) {
    if (!tokens.refresh_token) return null;
    try {
      const refreshed = await refreshAccessToken(tokens.refresh_token);
      return refreshed.access_token;
    } catch {
      return null;
    }
  }

  return tokens.access_token;
}

/**
 * Get stored tokens (for checking connection status).
 */
export function getStoredTokens(): GoogleTokens | null {
  const userId = "default";
  return tokenStore.get(userId) || null;
}

/**
 * Check if Gmail is connected.
 */
export function isGmailConnected(): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return false;
  return Date.now() < tokens.expires_at;
}

/**
 * Get the permissions granted by the current token scope.
 */
export function getGmailPermissions(): GmailPermissions {
  const tokens = getStoredTokens();
  if (!tokens) {
    return { canRead: false, canSend: false, canDraft: false };
  }

  const scope = tokens.scope || "";
  return {
    canRead: scope.includes("gmail.readonly") || scope.includes("gmail.modify"),
    canSend: scope.includes("gmail.send"),
    canDraft: scope.includes("gmail.compose") || scope.includes("gmail.modify"),
  };
}

/**
 * Check if Calendar is connected (same token as Gmail — checks if token exists and calendar scope was granted).
 */
export function isCalendarConnected(): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return false;
  if (Date.now() > tokens.expires_at) return false;
  const scope = tokens.scope || "";
  return scope.includes("calendar");
}

/**
 * Revoke access (disconnect Gmail & Calendar).
 */
export function disconnectGmail(): void {
  const userId = "default";
  tokenStore.delete(userId);
}

/**
 * Disconnect Calendar specifically (alias for full disconnect since tokens are shared).
 */
export function disconnectCalendar(): void {
  disconnectGmail();
}

/**
 * Get the OAuth redirect URI based on environment.
 */
function getRedirectUri(): string {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/api/auth/google/callback`;
}
