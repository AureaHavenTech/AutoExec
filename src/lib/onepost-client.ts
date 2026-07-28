/**
 * OnePost AI API Client for Axel AI.
 * Calls OnePost AI's external API to generate content programmatically.
 * 
 * Used by the action execution engine when users request
 * social media content creation from within Axel AI.
 */

const ONEPOST_API_BASE = process.env.ONEPOST_API_BASE || "https://onepostai.vercel.app";
const ONEPOST_API_KEY = process.env.ONEPOST_API_KEY || "";

export interface OnePostGenerateRequest {
  prompt: string;
  platform?: string;
  style?: string;
}

export interface OnePostGenerateResult {
  success: boolean;
  content?: string;
  platform?: string;
  platforms?: string[];
  hashtags?: string[];
  metadata?: {
    generatedBy: string;
    requestedVia: string;
    timestamp: string;
  };
  error?: string;
}

/**
 * Call OnePost AI to generate social media content.
 */
export async function generateOnePostContent(
  params: OnePostGenerateRequest
): Promise<OnePostGenerateResult> {
  const { prompt, platform = "all", style = "casual" } = params;

  if (!ONEPOST_API_KEY) {
    return {
      success: false,
      error: "ONEPOST_API_KEY not configured on Axel AI server",
    };
  }

  try {
    const response = await fetch(`${ONEPOST_API_BASE}/api/external/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        platform,
        style,
        apiKey: ONEPOST_API_KEY,
      }),
    });

    const data = await response.json();
    return data as OnePostGenerateResult;
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to reach OnePost AI: ${error.message}`,
    };
  }
}

/**
 * Quick helper to get OnePost AI's base URL.
 */
export function getOnePostBaseUrl(): string {
  return ONEPOST_API_BASE;
}
