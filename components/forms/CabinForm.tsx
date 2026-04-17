'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createCabinAction, updateCabinAction } from '@/modules/cabins/actions';
import type { CabinInput } from '@/lib/validation/schemas';
import type { Cabin } from '@/modules/cabins/domain/types';
import { useTranslations } from 'next-intl';

interface CabinFormProps {
  /** When provided the form operates in edit mode. */
  cabin?: Cabin;
  /** Path to redirect to after a successful create or update. Defaults to /dashboard/owner/listings. */
  redirectPath?: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Reusable cabin listing form used for create and edit flows.
 * - In create mode: calls createCabinAction and redirects to /dashboard/owner/listings.
 * - In edit mode:   calls updateCabinAction and redirects to /dashboard/owner/listings.
 */
export default function CabinForm({ cabin, redirectPath = '/dashboard/owner/listings' }: CabinFormProps) {
  const router = useRouter();
  const t = useTranslations('cabinForm');
  const isEdit = !!cabin;

  const [title, setTitle] = useState(cabin?.title ?? '');
  const [slug, setSlug] = useState(cabin?.slug ?? '');
  const [description, setDescription] = useState(cabin?.description ?? '');
  const [location, setLocation] = useState(cabin?.location ?? '');
  const [maxGuests, setMaxGuests] = useState(cabin?.maxGuests ?? 2);
  const [pricePerNight, setPricePerNight] = useState(cabin?.pricePerNight ?? 0);
  const [amenitiesText, setAmenitiesText] = useState(
    cabin?.amenities?.join('\n') ?? '',
  );
  const [imageUrlsText, setImageUrlsText] = useState(
    cabin?.imageUrls?.join('\n') ?? '',
  );
  const [published, setPublished] = useState(cabin?.published ?? false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from title only in create mode
  useEffect(() => {
    if (!isEdit) {
      setSlug(slugify(title));
    }
  }, [title, isEdit]);

  function parseLines(text: string): string[] {
    return text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const amenities = parseLines(amenitiesText);
    const imageUrls = parseLines(imageUrlsText);

    const input: CabinInput = {
      title,
      slug,
      description,
      location,
      maxGuests,
      pricePerNight,
      amenities,
      imageUrls,
      published,
    };

    setLoading(true);
    try {
      const result = isEdit
        ? await updateCabinAction(cabin.id, input)
        : await createCabinAction(input);

      if (!result.ok) {
        setError(result.error);
        if (result.details) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(result.details)) {
            if (v?.[0]) flat[k] = v[0];
          }
          setFieldErrors(flat);
        }
        return;
      }

      router.push(redirectPath);
    } catch {
      setError(t('genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Basic info */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-gray-900">
          {t('basicInfo')}
        </legend>

        <Input
          label={t('titleLabel')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder={t('titlePlaceholder')}
          error={fieldErrors.title}
        />

        <Input
          label={t('slugLabel')}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          placeholder={t('slugPlaceholder')}
          hint={t('slugHint')}
          error={fieldErrors.slug}
        />

        <Input
          label={t('locationLabel')}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          placeholder={t('locationPlaceholder')}
          error={fieldErrors.location}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            {t('descriptionLabel')} <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder={t('descriptionPlaceholder')}
            aria-invalid={!!fieldErrors.description}
            aria-describedby={
              fieldErrors.description ? 'description-error' : undefined
            }
            className={[
              'rounded-md border px-3 py-2 text-sm shadow-sm transition',
              'focus:outline-none focus:ring-2 focus:ring-pine-500',
              fieldErrors.description
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300',
            ].join(' ')}
          />
          {fieldErrors.description && (
            <p id="description-error" className="text-xs text-red-600" role="alert">
              {fieldErrors.description}
            </p>
          )}
        </div>
      </fieldset>

      {/* Pricing & capacity */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-gray-900">
          {t('pricingCapacity')}
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="pricePerNight"
              className="text-sm font-medium text-gray-700"
            >
              {t('priceLabel')}{' '}
              <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="pricePerNight"
              type="number"
              min={0}
              step={1}
              value={pricePerNight}
              onChange={(e) => setPricePerNight(Number(e.target.value))}
              required
              aria-invalid={!!fieldErrors.pricePerNight}
              className={[
                'rounded-md border px-3 py-2 text-sm shadow-sm transition',
                'focus:outline-none focus:ring-2 focus:ring-pine-500',
                fieldErrors.pricePerNight
                  ? 'border-red-400'
                  : 'border-gray-300',
              ].join(' ')}
            />
            {fieldErrors.pricePerNight && (
              <p className="text-xs text-red-600" role="alert">
                {fieldErrors.pricePerNight}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="maxGuests"
              className="text-sm font-medium text-gray-700"
            >
              {t('maxGuestsLabel')}{' '}
              <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="maxGuests"
              type="number"
              min={1}
              max={20}
              value={maxGuests}
              onChange={(e) => setMaxGuests(Number(e.target.value))}
              required
              aria-invalid={!!fieldErrors.maxGuests}
              className={[
                'rounded-md border px-3 py-2 text-sm shadow-sm transition',
                'focus:outline-none focus:ring-2 focus:ring-pine-500',
                fieldErrors.maxGuests ? 'border-red-400' : 'border-gray-300',
              ].join(' ')}
            />
            {fieldErrors.maxGuests && (
              <p className="text-xs text-red-600" role="alert">
                {fieldErrors.maxGuests}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Amenities & images */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-gray-900">
          {t('amenitiesImages')}
        </legend>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="amenities"
            className="text-sm font-medium text-gray-700"
          >
            {t('amenitiesLabel')}{' '}
            <span className="text-gray-400 font-normal">{t('amenitiesHint')}</span>
          </label>
          <textarea
            id="amenities"
            rows={4}
            value={amenitiesText}
            onChange={(e) => setAmenitiesText(e.target.value)}
            placeholder={t('amenitiesPlaceholder')}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-pine-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="imageUrls"
            className="text-sm font-medium text-gray-700"
          >
            {t('imageUrlsLabel')}{' '}
            <span className="text-gray-400 font-normal">{t('imageUrlsHint')}</span>
          </label>
          <textarea
            id="imageUrls"
            rows={3}
            value={imageUrlsText}
            onChange={(e) => setImageUrlsText(e.target.value)}
            placeholder={t('imageUrlsPlaceholder')}
            aria-invalid={!!fieldErrors.imageUrls}
            className={[
              'rounded-md border px-3 py-2 text-sm shadow-sm transition',
              'focus:outline-none focus:ring-2 focus:ring-pine-500',
              fieldErrors.imageUrls ? 'border-red-400' : 'border-gray-300',
            ].join(' ')}
          />
          {fieldErrors.imageUrls && (
            <p className="text-xs text-red-600" role="alert">
              {fieldErrors.imageUrls}
            </p>
          )}
        </div>
      </fieldset>

      {/* Publish toggle */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-pine-600 focus:ring-pine-500"
        />
        <label htmlFor="published" className="text-sm font-medium text-gray-700">
          {t('publishToggleLabel')}
          <span className="ml-1 font-normal text-gray-500">
            {t('publishToggleHint')}
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          {t('cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? t('saveChanges') : t('addCabin')}
        </Button>
      </div>
    </form>
  );
}
