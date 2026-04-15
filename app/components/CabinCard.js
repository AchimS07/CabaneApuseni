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
        <a href={`/cabins/${cabin.slug}`}>
          Vezi detalii pentru {cabin.name}
        </a>
      </p>
    </article>
  );
}
