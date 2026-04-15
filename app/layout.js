import './globals.css';

export const metadata = {
  metadataBase: new URL('https://cabaneapuseni.ro'),
  title: {
    default: 'Cabane Apuseni',
    template: '%s | Cabane Apuseni'
  },
  description:
    'Descoperă cabane primitoare în Munții Apuseni, ideale pentru weekenduri în natură și vacanțe în familie.',
  openGraph: {
    title: 'Cabane Apuseni',
    description:
      'Descoperă cabane primitoare în Munții Apuseni, ideale pentru weekenduri în natură și vacanțe în familie.',
    url: 'https://cabaneapuseni.ro/',
    siteName: 'Cabane Apuseni',
    locale: 'ro_RO',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cabane Apuseni',
    description:
      'Descoperă cabane primitoare în Munții Apuseni, ideale pentru weekenduri în natură și vacanțe în familie.'
  },
  alternates: {
    canonical: '/'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body>
        <a className="skip-link" href="#main-content">
          Mergi la conținutul principal
        </a>
        {children}
      </body>
    </html>
  );
}
