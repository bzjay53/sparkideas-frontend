import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sparkideas-app.vercel.app/api'
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/v1/:path*`
      }
    ]
  }
}

export default nextConfig