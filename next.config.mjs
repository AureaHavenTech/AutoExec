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
};

export default nextConfig;
