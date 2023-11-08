/** @type {import('next').NextConfig} */
const nextConfig = {
    images: { remotePatterns: [{
      hostname: "arweave.net", 
    },
  {
    hostname: "image-cache-service-z3w7d7dnea-ew.a.run.app"
  }] },
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