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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },

  // Enable typed routes for safer navigation
  typedRoutes: false,

  // ─── Legacy route redirects ──────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/auth/login',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/auth/register',
        destination: '/register',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
