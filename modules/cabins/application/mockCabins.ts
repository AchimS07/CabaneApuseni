import type { Cabin } from '@/modules/cabins/domain/types';

const NOW_ISO = '2026-01-01T00:00:00.000Z';

export const MOCK_CABINS: Cabin[] = [
  {
    id: 'mock-cabin-1',
    title: 'Cabana Valea Stânelor',
    slug: 'cabana-valea-stanelor',
    description:
      'Cabină cochetă în inima Apusenilor, ideală pentru familii și grupuri mici. Dispune de living cu șemineu, bucătărie utilată și terasă cu vedere spre pădure.',
    location: 'Arieșeni',
    maxGuests: 6,
    pricePerNight: 450,
    amenities: ['Wi-Fi', 'Șemineu', 'Parcare', 'Bucătărie utilată'],
    imageUrls: ['https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80&auto=format&fit=crop'],
    published: true,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
  },
  {
    id: 'mock-cabin-2',
    title: 'Cabana Piatra Secuiului',
    slug: 'cabana-piatra-secuiului',
    description:
      'Refugiu liniștit cu design rustic-modern, aproape de trasee montane și zone panoramice. Perfectă pentru un weekend relaxant în natură.',
    location: 'Rimetea',
    maxGuests: 4,
    pricePerNight: 380,
    amenities: ['Jacuzzi exterior', 'Grătar', 'Încălzire centrală', 'Self check-in'],
    imageUrls: ['https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80&auto=format&fit=crop'],
    published: true,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
  },
  {
    id: 'mock-cabin-3',
    title: 'Cabana Foc de Brad',
    slug: 'cabana-foc-de-brad',
    description:
      'Cabană spațioasă cu priveliște spre creste, potrivită pentru grupuri mai mari. Include zonă de dining generoasă și foișor exterior pentru seri lungi.',
    location: 'Mărișel',
    maxGuests: 8,
    pricePerNight: 620,
    amenities: ['Saună', 'Ciubăr', 'Terasă', 'Smart TV'],
    imageUrls: ['https://images.unsplash.com/photo-1472224371017-08207f84aaae?w=1200&q=80&auto=format&fit=crop'],
    published: true,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
  },
];
