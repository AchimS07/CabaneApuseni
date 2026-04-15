/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Components can import server-only modules
  serverExternalPackages: ['pino', 'firebase-admin'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },

  experimental: {
    // Enable typed routes for safer navigation
    typedRoutes: false,
  },
};

export default nextConfig;

