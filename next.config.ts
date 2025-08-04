import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@uiw/react-md-editor', '@uiw/react-markdown-preview'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })
    return config
  },
}

export default nextConfig
