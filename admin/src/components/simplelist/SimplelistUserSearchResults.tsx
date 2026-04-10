import Link from "next/link";
import { BrewmoteStateCallout } from "@/components/brewmote/BrewmoteStateCallout";
import { formatAdminDateTime } from "@/lib/formatAdmin";
import { loadSimpleListUserSearch } from "@/server/simplelistPageLoaders";

type Props = {
  email: string | undefined;
};

export async function SimplelistUserSearchResults({ email }: Props) {
  const result = await loadSimpleListUserSearch(email);

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
          <div className="simplelist-user-row">
            <div>
              <strong>{u.email ?? "—"}</strong>
              <span className="muted brewmote-result-list__id">{u.id}</span>
            </div>
            <div className="simplelist-user-row__meta muted">Created {formatAdminDateTime(u.created_at)}</div>
            <Link
              className="btn simplelist-user-row__cta"
              href={`/admin/simplelist?listsForUser=${encodeURIComponent(u.id)}${email ? `&userEmail=${encodeURIComponent(email)}` : ""}`}
            >
              View lists
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
