import CabinList from './components/CabinList';
import { cabins } from './data/cabins';

export const metadata = {
  title: 'Acasă',
  description:
    'Alege o cabană în Apuseni după locație, capacitate și buget. Găsește rapid locul potrivit pentru următoarea escapadă.',
  alternates: {
    canonical: '/'
  }
};

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <nav aria-label="Navigație principală">
          <a href="/">Cabane Apuseni</a>
          <a href="#cabins">Vezi cabanele disponibile</a>
        </nav>
      </header>

      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title">Cabane confortabile în inima Apusenilor</h1>
          <p>
            Descoperă cazări potrivite pentru cupluri, familii sau grupuri
            restrânse, cu peisaje montane și acces rapid la trasee.
          </p>
          <p className="cta-group">
            <a href="#cabins">Explorează cabanele</a>
            <a href="mailto:rezervari@cabaneapuseni.ro">
              Trimite o cerere de rezervare
            </a>
          </p>
        </section>

        <section id="cabins" aria-labelledby="cabins-title">
          <h2 id="cabins-title">Cabane recomandate</h2>
          <CabinList cabins={cabins} />
        </section>
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Cabane Apuseni. Toate drepturile rezervate.</p>
      </footer>
    </>
  );
}
