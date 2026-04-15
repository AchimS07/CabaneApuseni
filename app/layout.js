import './globals.css';
import Providers from './providers';
import Navbar from '../components/Navbar';

export const metadata = {
  title: {
    default:  'Cabane Apuseni',
    template: '%s | Cabane Apuseni',
  },
  description: 'Find and book the perfect mountain cabin in the Apuseni Mountains of Romania.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-forest-900 text-forest-100 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-1">
              <p className="text-sm">&copy; {new Date().getFullYear()} Cabane Apuseni. All rights reserved.</p>
              <p className="text-xs text-forest-400">Mountain cabin marketplace for the Apuseni region of Romania.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

