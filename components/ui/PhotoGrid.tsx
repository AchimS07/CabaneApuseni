'use client';

/**
 * components/ui/PhotoGrid.tsx
 * AirBnb-style photo grid:
 *   – Desktop: 1 large image left + 2×2 grid right
 *   – Mobile: horizontal scroll strip
 *   – "Afișează toate" button opens a fullscreen lightbox
 */

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, PhotosIcon } from './Icons';

interface PhotoGridProps {
  images: string[];
  altPrefix: string;
}

export function PhotoGrid({ images, altPrefix }: PhotoGridProps) {
  const t = useTranslations('photoGrid');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + images.length) % images.length : null,
    );
  }, [images.length]);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));
  }, [images.length]);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    }
    document.addEventListener('keydown', onKey);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, prevPhoto, nextPhoto]);

  const mainImage = images[0] ?? '';
  const gridImages = images.slice(1, 5); // up to 4 supporting images

  if (images.length === 0) {
    return (
      <div
        className="flex h-72 items-center justify-center rounded-2xl bg-gray-100 text-7xl sm:h-96"
        aria-hidden="true"
      >
        🏔️
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop grid layout ── */}
      <div className="hidden sm:block">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: '480px' }}
        >
          <div className="grid h-full gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* Large image left */}
            <button
              type="button"
              className="relative overflow-hidden rounded-l-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
              onClick={() => openLightbox(0)}
              aria-label={t('openPhotoLabel', { number: 1, total: images.length })}
            >
              <Image
                src={mainImage}
                alt={t('photoAlt', { prefix: altPrefix, number: 1 })}
                fill
                className="object-cover transition-opacity hover:opacity-95"
                sizes="(max-width: 1280px) 50vw, 600px"
                priority
              />
            </button>

            {/* 2×2 grid right */}
            {gridImages.length > 0 && (
              <div className="grid grid-rows-2 gap-2">
                {[0, 1].map((row) => (
                  <div key={row} className="grid grid-cols-2 gap-2">
                    {[0, 1].map((col) => {
                      const idx = row * 2 + col + 1; // image index (1-based)
                      const img = images[idx];
                      const isLast = idx === 4 && images.length > 5;
                      if (!img) {
                        return (
                          <div
                            key={col}
                            className="rounded-sm bg-gray-100"
                            aria-hidden="true"
                          />
                        );
                      }
                      return (
                        <button
                          key={col}
                          type="button"
                          className={[
                            'relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-1',
                            row === 0 && col === 1 ? 'rounded-tr-2xl' : '',
                            row === 1 && col === 1 ? 'rounded-br-2xl' : '',
                          ].join(' ')}
                          onClick={() => openLightbox(idx)}
                          aria-label={t('openPhotoLabel', { number: idx + 1, total: images.length })}
                        >
                          <Image
                            src={img}
                            alt={t('photoAlt', { prefix: altPrefix, number: idx + 1 })}
                            fill
                            className="object-cover transition-opacity hover:opacity-90"
                            sizes="(max-width: 1280px) 25vw, 300px"
                          />
                          {/* "Show all" overlay on last visible tile */}
                          {isLast && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                              <span className="text-sm font-semibold">
                                {t('morePhotos', { count: images.length - 5 })}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* "Afișează toate fotografiile" button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => openLightbox(0)}
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-gray-900 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
            >
              <PhotosIcon size={16} aria-hidden="true" />
              {t('showAllPhotos', { count: images.length })}
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile: horizontal strip ── */}
      <div className="sm:hidden">
        <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              className="relative h-56 w-72 shrink-0 overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
              onClick={() => openLightbox(i)}
              aria-label={t('openPhotoLabel', { number: i + 1, total: images.length })}
            >
              <Image
                src={img}
                alt={t('photoAlt', { prefix: altPrefix, number: i + 1 })}
                fill
                className="object-cover"
                sizes="288px"
              />
            </button>
          ))}
        </div>
        <p className="mt-1 text-center text-xs text-gray-400">
          {images.length === 1
            ? t('photoScrollHintSingular')
            : t('photoScrollHintPlural', { count: images.length })}
        </p>
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('lightboxLabel')}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
        >
          {/* Close */}
          <button
            type="button"
            onClick={closeLightbox}
            aria-label={t('closeLightbox')}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <XIcon size={20} aria-hidden="true" />
          </button>

          {/* Counter */}
          <p
            className="absolute left-1/2 top-4 -translate-x-1/2 text-sm text-white/80"
            aria-live="polite"
          >
            {lightboxIndex + 1} / {images.length}
          </p>

          {/* Previous */}
          <button
            type="button"
            onClick={prevPhoto}
            aria-label={t('prevPhotoLabel')}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeftIcon size={22} aria-hidden="true" />
          </button>

          {/* Image */}
          <div className="relative h-full max-h-[85vh] w-full max-w-5xl px-16">
            <Image
              src={images[lightboxIndex]}
              alt={t('photoAlt', { prefix: altPrefix, number: lightboxIndex + 1 })}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={nextPhoto}
            aria-label={t('nextPhotoLabel')}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronRightIcon size={22} aria-hidden="true" />
          </button>

          {/* Thumbnail strip */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={t('goToPhotoLabel', { number: i + 1 })}
                aria-pressed={i === lightboxIndex}
                className={[
                  'rounded-full transition-all duration-200',
                  i === lightboxIndex
                    ? 'h-2.5 w-2.5 bg-white'
                    : 'h-1.5 w-1.5 bg-white/50 hover:bg-white/80',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
