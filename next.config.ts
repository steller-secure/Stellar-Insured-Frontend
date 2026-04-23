import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@stellar/stellar-sdk"],
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          chunks: "all",
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 20,
              chunks: "all",
            },
            common: {
              name: "common",
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              chunks: "all",
            },
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
