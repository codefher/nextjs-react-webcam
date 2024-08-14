// next.config.js
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Proporciona el polyfill para 'encoding'
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        child_process: false,
        tls: false,
        net: false,
        encoding: require.resolve('encoding') // Usa el polyfill instalado
      }
    }
    return config
  }
}

module.exports = nextConfig
