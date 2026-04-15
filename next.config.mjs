/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Components can import server-only modules
  serverExternalPackages: ['pino', 'firebase-admin'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
    ],
  },

  // Enable typed routes for safer navigation
  typedRoutes: false,
};

export default nextConfig;
