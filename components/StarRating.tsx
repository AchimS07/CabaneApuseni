'use client';

import { useState } from 'react';

interface Props {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const SIZE: Record<string, string> = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };

export default function StarRating({ value, onChange, size = 'md', readonly = false }: Props) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div
      className={'flex gap-0.5 ' + (SIZE[size] ?? SIZE.md)}
      role={readonly ? 'img' : 'group'}
      aria-label={'Rating: ' + value + ' out of 5 stars'}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          aria-label={'Rate ' + star + (star === 1 ? ' star' : ' stars')}
          aria-pressed={value >= star}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={
            'transition-transform ' +
            (readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110') +
            ' disabled:cursor-default'
          }
        >
          <span aria-hidden="true">{active >= star ? '★' : '☆'}</span>
        </button>
      ))}
    </div>
  );
}
