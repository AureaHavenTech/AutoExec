/**
 * GET /api/auth/google
 * Initiates the Google OAuth2 flow for Gmail integration.
 * Redirects the user to Google's consent screen.
 */
import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-auth";

export async function GET() {
  try {
    const authUrl = getGoogleAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
