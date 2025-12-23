import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*', // Proxy to Django
      },
      // Also proxy Swagger UI and Schema if needed, but they are under /api/ in my urls.py so it's covered.
      // Wait, Swagger is at /api/schema/. Covered.
    ];
  },
};

export default nextConfig;
