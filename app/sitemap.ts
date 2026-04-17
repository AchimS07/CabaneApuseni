import type { MetadataRoute } from 'next';
import { getPublishedCabins } from '@/modules/cabins/application/cabinService';

export const revalidate = 3600; // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cabaneapuseni.ro';

  const result = await getPublishedCabins();
  const cabins = result.ok ? result.data : [];

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cabins`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const cabinRoutes: MetadataRoute.Sitemap = cabins.map((cabin) => ({
    url: `${baseUrl}/cabins/${cabin.slug}`,
    lastModified: new Date(cabin.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...cabinRoutes];
}
