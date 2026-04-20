import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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

  // ─── Internal rewrites ────────────────────────────────────────────────────────
  async rewrites() {
    return [
      {
        // Expose favorites as a clean URL; the dashboard page renders it via ?view=favorites
        source: '/dashboard/favorites',
        destination: '/dashboard?view=favorites',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
