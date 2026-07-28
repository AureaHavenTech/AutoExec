import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Axel AI — Edge Middleware
 * Runs on Vercel's Edge Network for minimal latency.
 * - Adds cache headers for static assets
 * - Applies security headers
 * - Enables CORS for API routes
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── Security headers (all routes) ──────────────────────────
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // ── CORS for API routes ────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    response.headers.set("Cache-Control", "no-store, must-revalidate");

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  // ── Static asset caching ────────────────────────────────────
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.match(/\.(js|css|svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot|json)$/)
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // ── Image optimization cache ────────────────────────────────
  if (pathname.startsWith("/_next/image")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800"
    );
  }

  // ── HTML / page cache (short TTL for fresh content) ─────────
  if (
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/") &&
    !pathname.includes(".")
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files served by Next.js with hashed filenames)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
