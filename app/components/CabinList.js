import CabinCard from './CabinCard';

export default function CabinList({ cabins }) {
  if (!cabins?.length) {
    return <p>Momentan nu există cabane disponibile.</p>;
  }

  return (
    <ul className="cabin-list">
      {cabins.map((cabin) => (
        <li key={cabin.slug}>
          <CabinCard cabin={cabin} />
        </li>
      ))}
    </ul>
  );
}
