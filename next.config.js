/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack with empty config to use defaults
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Fix for googleapis and other packages that use Node.js built-in modules
    if (!isServer) {
      // Don't attempt to bundle server-only modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        worker_threads: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
