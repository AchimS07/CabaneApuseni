export const metadata = {
  title: 'Cabane Apuseni',
  description: 'Minimal Next.js starter'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
