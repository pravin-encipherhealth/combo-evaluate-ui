import type { NextConfig } from 'next'

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080'

const nextConfig: NextConfig = {
  /**
   * Proxy /api/v1/* to the Spring Boot backend.
   * Client-side fetches use relative URLs → Next.js rewrites them to the backend.
   * Server components call BACKEND_URL directly (see lib/api.ts).
   */
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
