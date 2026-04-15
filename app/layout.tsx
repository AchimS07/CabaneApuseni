import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Cabane Apuseni',
    template: '%s | Cabane Apuseni',
  },
  description: 'Book your perfect mountain cabin retreat in the Apuseni Mountains.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="min-h-screen bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
