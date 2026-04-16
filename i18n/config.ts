export const locales = ['ro', 'en', 'hu'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ro';
