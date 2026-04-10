import { loadBrewmoteCafeSearch } from "@/server/brewmotePageLoaders";
import { BrewmoteStateCallout } from "./BrewmoteStateCallout";

export async function BrewmoteCafeSearchResults({ name }: { name: string | undefined }) {
  const result = await loadBrewmoteCafeSearch(name);

  if (result.status === "idle") {
    return (
      <BrewmoteStateCallout variant="info" title="Search cafes by name">
        Enter part of a name. Matching is case-insensitive.
      </BrewmoteStateCallout>
    );
  }

  if (result.status === "not_configured") {
    return (
      <BrewmoteStateCallout variant="todo" title="Cafes aren’t connected">
        {result.message}
      </BrewmoteStateCallout>
    );
  }

  if (result.status === "error") {
    return (
      <BrewmoteStateCallout variant="error" title="Cafe search failed">
        {result.message}
      </BrewmoteStateCallout>
    );
  }

  if (result.status === "empty") {
    return (
      <BrewmoteStateCallout variant="empty" title="No cafes found">
        Try a different spelling or shorter phrase.
      </BrewmoteStateCallout>
    );
  }

  return (
    <ul className="brewmote-result-list">
      {result.rows.map((row, i) => (
        <li key={i} className="brewmote-result-list__item brewmote-result-list__item--json">
          <pre className="brewmote-json-preview">{JSON.stringify(row, null, 2)}</pre>
        </li>
      ))}
    </ul>
  );
}
