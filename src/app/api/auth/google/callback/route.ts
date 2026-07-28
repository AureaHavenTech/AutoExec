/**
 * GET /api/auth/google/callback
 * Handles the OAuth2 callback from Google.
 * Exchanges the authorization code for access/refresh tokens,
 * then redirects the user back to the dashboard.
 */
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      const dashboardUrl = new URL("/dashboard", request.url);
      dashboardUrl.searchParams.set("gmail_error", error);
      return NextResponse.redirect(dashboardUrl);
    }

    if (!code) {
      const dashboardUrl = new URL("/dashboard", request.url);
      dashboardUrl.searchParams.set("gmail_error", "no_code");
      return NextResponse.redirect(dashboardUrl);
    }

    // Exchange code for tokens
    await exchangeCodeForTokens(code);

    // Redirect to dashboard with success
    const dashboardUrl = new URL("/dashboard", request.url);
    dashboardUrl.searchParams.set("gmail_connected", "true");
    return NextResponse.redirect(dashboardUrl);
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    const dashboardUrl = new URL("/dashboard", request.url);
    dashboardUrl.searchParams.set(
      "gmail_error",
      encodeURIComponent(error.message || "oauth_failed")
    );
    return NextResponse.redirect(dashboardUrl);
  }
}
