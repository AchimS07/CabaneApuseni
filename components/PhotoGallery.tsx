'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Props {
  photos: string[];
  title: string;
}

export default function PhotoGallery({ photos, title }: Props) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(
    () => setSelected((i) => (i - 1 + photos.length) % photos.length),
    [photos.length],
  );
  const next = useCallback(
    () => setSelected((i) => (i + 1) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      setLightbox(false);
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prev, next]);

  if (photos.length === 0) {
    return (
      <div className="bg-stone-100 rounded-xl h-64 flex items-center justify-center">
        <p className="text-stone-400 text-sm">No photos available</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <button
          onClick={() => setLightbox(true)}
          className="w-full relative aspect-video rounded-xl overflow-hidden cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine-600"
          aria-label={'Open photo ' + (selected + 1) + ' of ' + photos.length + ' in lightbox'}
        >
          <Image
            src={photos[selected]}
            alt={title + ' – photo ' + (selected + 1)}
            fill
            className="object-cover"
            priority={selected === 0}
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </button>

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            aria-label="Photo thumbnails"
          >
            {photos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setSelected(idx)}
                aria-label={'Photo ' + (idx + 1)}
                aria-pressed={selected === idx}
                className={
                  'relative flex-none w-20 h-16 rounded-lg overflow-hidden transition-all ' +
                  (selected === idx
                    ? 'ring-2 ring-pine-600 ring-offset-1 opacity-100'
                    : 'opacity-60 hover:opacity-90')
                }
              >
                <Image
                  src={photo}
                  alt={title + ' thumbnail ' + (idx + 1)}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={'Photo lightbox – ' + title}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-stone-300 text-3xl w-10 h-10 flex items-center justify-center"
            onClick={() => setLightbox(false)}
            aria-label="Close lightbox"
          >
            ×
          </button>

          {photos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 text-5xl w-12 h-12 flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 text-5xl w-12 h-12 flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}

          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[selected]}
              alt={title + ' – photo ' + (selected + 1)}
              width={1200}
              height={800}
              className="object-contain w-full h-auto max-h-[85vh] rounded"
            />
          </div>

          <p className="absolute bottom-4 text-white text-sm" aria-live="polite">
            {(selected + 1) + ' / ' + photos.length}
          </p>
        </div>
      )}
    </>
  );
}
