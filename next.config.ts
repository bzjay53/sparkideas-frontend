import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://31.220.83.213:5001/api/v1/:path*'
      }
    ]
  }
}

export default nextConfig