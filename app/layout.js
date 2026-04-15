import FirebaseProvider from './firebase-provider';

export const metadata = {
  title: 'Cabane Apuseni',
  description: 'Minimal Next.js starter'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <FirebaseProvider />
        {children}
      </body>
    </html>
  );
}
