import { UserCountTrendSparkline } from "@/components/admin/UserCountTrendSparkline";
import { formatAdminDateTime } from "@/lib/formatAdmin";
import { loadBrewmoteUsersOverview } from "@/server/brewmotePageLoaders";
import { BrewmoteStateCallout } from "./BrewmoteStateCallout";

export async function BrewmoteUsersSection() {
  const result = await loadBrewmoteUsersOverview();

  if (result.status === "error") {
    return (
      <section className="panel-block admin-section" aria-labelledby="brewmote-users-heading">
        <h2 id="brewmote-users-heading" className="admin-section-title">
          Users
        </h2>
        <BrewmoteStateCallout variant="error" title="Could not load users">
          {result.message}
        </BrewmoteStateCallout>
      </section>
    );
  }

  const { total, recent, trend, recentError } = result;

  return (
    <section className="panel-block admin-section" aria-labelledby="brewmote-users-heading">
      <h2 id="brewmote-users-heading" className="admin-section-title">
        Users
      </h2>
      <p className="muted admin-section-desc">Total accounts and the newest signups (with email when available).</p>

      <div className="brewmote-users-split">
        <article className="stat-card stat-card--brewmote">
          <p className="stat-card__label">Total users</p>
          <p className="stat-card__value">{new Intl.NumberFormat().format(total)}</p>
          <UserCountTrendSparkline result={trend} variant="brewmote" />
        </article>

        <div className="brewmote-recent">
          <h3 className="brewmote-subheading">Recent signups</h3>
          {recentError ? (
            <BrewmoteStateCallout variant="error" title="Could not load recent signups">
              {recentError}
            </BrewmoteStateCallout>
          ) : recent.length === 0 ? (
            <BrewmoteStateCallout variant="empty" title="No recent signups">
              No profile rows yet, or nothing came back from the server.
            </BrewmoteStateCallout>
          ) : (
            <ul className="signup-list">
              {recent.map((u) => (
                <li key={u.id} className="signup-list__item signup-list__item--stack">
                  <span className="signup-list__email">{u.email ?? "—"}</span>
                  {u.full_name ? (
                    <span className="signup-list__meta muted">{u.full_name}</span>
                  ) : null}
                  <span className="signup-list__meta muted">{formatAdminDateTime(u.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
