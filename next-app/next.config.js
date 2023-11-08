const { hostname } = require('os');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "**.nftstorage.link"
      },
      {
        hostname: "ipfs.io"
      },
      {
        hostname: "cloudflare-ipfs.com"
      },
      {
        protocol: "https",
        hostname: "ipfs.near.social"
      }
    ]
  },
  webpack(config) {
    // eslint-disable-next-line no-param-reassign
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, // https://stackoverflow.com/a/67478653/470749
    };

    return config;
  },

  experimental: {
    webpackBuildWorker: true
  },
};

module.exports = nextConfig;