import Link from 'next/link';

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  ctaLabel,
  ctaHref,
  highlighted = false,
  badge,
}: PricingCardProps) {
  return (
    <article
      className={[
        'relative flex flex-col rounded-2xl border p-8 shadow-sm transition-shadow hover:shadow-md',
        highlighted
          ? 'border-pine-600 bg-pine-700 text-white'
          : 'border-gray-200 bg-white text-gray-900',
      ].join(' ')}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-earth-400 px-4 py-1 text-xs font-semibold text-white shadow">
          {badge}
        </span>
      )}

      <div className="mb-6">
        <h3 className={['text-xl font-bold', highlighted ? 'text-white' : 'text-gray-900'].join(' ')}>
          {name}
        </h3>
        <p className={['mt-1 text-sm', highlighted ? 'text-pine-200' : 'text-gray-500'].join(' ')}>
          {description}
        </p>
      </div>

      <div className="mb-6 flex items-end gap-1">
        <span className={['text-4xl font-extrabold', highlighted ? 'text-white' : 'text-gray-900'].join(' ')}>
          {price}
        </span>
        {period && (
          <span className={['mb-1 text-sm', highlighted ? 'text-pine-200' : 'text-gray-500'].join(' ')}>
            /{period}
          </span>
        )}
      </div>

      <ul className="mb-8 flex flex-col gap-3" role="list">
        {features.map((f) => (
          <li key={f.text} className="flex items-start gap-2 text-sm">
            {f.included ? (
              <span
                className={['mt-0.5 flex-shrink-0 text-base', highlighted ? 'text-green-300' : 'text-green-500'].join(' ')}
                aria-hidden="true"
              >
                ✓
              </span>
            ) : (
              <span
                className={['mt-0.5 flex-shrink-0 text-base', highlighted ? 'text-pine-300' : 'text-gray-300'].join(' ')}
                aria-hidden="true"
              >
                –
              </span>
            )}
            <span className={f.included ? '' : highlighted ? 'text-pine-300' : 'text-gray-400'}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Link
          href={ctaHref}
          className={[
            'block w-full rounded-xl px-6 py-3 text-center text-sm font-semibold transition',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            highlighted
              ? 'bg-white text-pine-700 hover:bg-pine-50 focus:ring-white focus:ring-offset-pine-700'
              : 'bg-ember-500 text-white hover:bg-ember-600 focus:ring-ember-500',
          ].join(' ')}
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
