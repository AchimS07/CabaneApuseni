import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cabane Apuseni – Cazare la Munte',
  description:
    'Descoperă cele mai frumoase cabane din Munții Apuseni. Rezervă acum online, confirmare imediată.',
};

/**
 * Homepage — redirects to the cabins listing page.
 * All discovery content lives at /cabins for clean URLs and ISR caching.
 */
export default function HomePage() {
  redirect('/cabins');
}
