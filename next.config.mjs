/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip/brotli compression for API responses and pages
  compress: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Generate clean ETags for efficient cache revalidation
  generateEtags: true,

  // Optimize static asset serving
  reactStrictMode: true,

  // Security headers (QA: CSP + rate-limit hardening)
  // (redeploy trigger marker #2 — no functional change)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.openai.com https://js.stripe.com https://www.googleapis.com https://graph.facebook.com https://api.instagram.com",
              "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
