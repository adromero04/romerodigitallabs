import { loadBrewmoteCafesCount, loadBrewmoteUserFavoritesCount } from "@/server/brewmotePageLoaders";
import { BrewmoteMetricBlock } from "./BrewmoteMetricBlock";

export async function BrewmoteCafesSection() {
  const [cafes, favorites] = await Promise.all([loadBrewmoteCafesCount(), loadBrewmoteUserFavoritesCount()]);

  return (
    <section className="panel-block admin-section" aria-labelledby="brewmote-cafes-heading">
      <h2 id="brewmote-cafes-heading" className="admin-section-title">
        Cafes &amp; favorites
      </h2>
      <p className="muted admin-section-desc">How many cafes are on file and how many favorites users have saved.</p>

      <div className="stats-grid stats-grid--large">
        <BrewmoteMetricBlock label="Cafes" result={cafes} />
        <BrewmoteMetricBlock label="User favorites" result={favorites} />
      </div>
    </section>
  );
}
