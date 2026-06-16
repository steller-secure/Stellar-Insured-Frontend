import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@stellar/stellar-sdk"],
  },
  // As of Next.js 16, Turbopack is the default bundler for `next dev` and
  // `next build`. The previous custom webpack `splitChunks` configuration was
  // only used to tune vendor/common chunk splitting for production builds —
  // behaviour that Turbopack handles automatically with its own optimized
  // chunking strategy. The webpack config has therefore been removed to resolve
  // the Turbopack/webpack mismatch build error. This empty `turbopack` block
  // opts into Turbopack explicitly; add options here if custom bundling is
  // needed in the future.
  turbopack: {},
};

export default nextConfig;
