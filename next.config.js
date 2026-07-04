/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, net: false, tls: false, crypto: false,
        path: false, os: false, stream: false, dgram: false,
        dns: false, http2: false, 'node-datachannel': false,
        buffer: require.resolve('buffer/'),
      }
    }
    return config
  },
}
module.exports = nextConfig
