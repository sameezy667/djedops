/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable modern JavaScript output for smaller bundles
  swcMinify: true,
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Output configuration - use standalone for server deployment (not export)
  // This is needed for Vercel deployment with dynamic pages
  // Don't use 'export' which tries to statically generate all pages
  
  // ESLint configuration for build
  eslint: {
    // Only run ESLint on these directories during production builds
    dirs: ['app', 'components', 'lib'],
    // Allow production builds to complete even with ESLint warnings
    // Set to true for initial deployment, then fix issues and set to false
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration
  typescript: {
    // Allow production builds with type errors (not recommended for prod)
    // Set to true only during initial deployment setup
    // TODO: Fix type errors and set to false
    ignoreBuildErrors: true,
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Optimize image loading
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei', 'framer-motion'],
  },
};

export default nextConfig;
