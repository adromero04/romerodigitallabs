import { formatAdminDateTime } from "@/lib/formatAdmin";
import { loadBrewmoteUserSearch } from "@/server/brewmotePageLoaders";
import { BrewmoteStateCallout } from "./BrewmoteStateCallout";

export async function BrewmoteUserSearchResults({ email }: { email: string | undefined }) {
  const result = await loadBrewmoteUserSearch(email);

  if (result.status === "idle") {
    return (
      <BrewmoteStateCallout variant="info" title="Search users by email">
        Looks up accounts by exact email (may take a moment on large projects).
      </BrewmoteStateCallout>
    );
  }

  if (result.status === "error") {
    return (
      <BrewmoteStateCallout variant="error" title="User search failed">
        {result.message}
      </BrewmoteStateCallout>
    );
  }

  if (result.status === "empty") {
    return <BrewmoteStateCallout variant="empty" title="No matching users">Try a different email.</BrewmoteStateCallout>;
  }

  return (
    <ul className="brewmote-result-list">
      {result.users.map((u) => (
        <li key={u.id} className="brewmote-result-list__item">
          <div>
            <strong>{u.email ?? "—"}</strong>
            <span className="muted brewmote-result-list__id">{u.id}</span>
          </div>
          <div className="muted brewmote-result-list__meta">Created {formatAdminDateTime(u.created_at)}</div>
        </li>
      ))}
    </ul>
  );
}
