import Link from 'next/link';

export default function CabinCard({ cabin }) {
  return (
    <article className="cabin-card">
      <h3>{cabin.name}</h3>
      <p>
        <strong>Locație:</strong> {cabin.location}
      </p>
      <p>
        <strong>Capacitate:</strong> {cabin.capacity} persoane
      </p>
      <p>
        <strong>Preț de la:</strong> {cabin.priceFrom} lei / noapte
      </p>
      <p>
        <Link href={`/cabins/${cabin.slug}`}>Vezi detalii</Link>
      </p>
    </article>
  );
}
