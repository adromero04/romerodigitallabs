import { UserCountTrendSparkline } from "@/components/admin/UserCountTrendSparkline";
import { BrewmoteStateCallout } from "@/components/brewmote/BrewmoteStateCallout";
import { formatAdminDateTime } from "@/lib/formatAdmin";
import { loadSimpleListUsersOverview } from "@/server/simplelistPageLoaders";

export async function SimplelistUsersSection() {
  const result = await loadSimpleListUsersOverview();

  if (result.status === "error") {
    return (
      <section className="panel-block admin-section" aria-labelledby="sl-users-heading">
        <h2 id="sl-users-heading" className="admin-section-title">
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
    <section className="panel-block admin-section" aria-labelledby="sl-users-heading">
      <h2 id="sl-users-heading" className="admin-section-title">
        Users
      </h2>
      <p className="muted admin-section-desc">Total accounts and the most recently created users from the directory.</p>

      <div className="brewmote-users-split">
        <article className="stat-card stat-card--simplelist">
          <p className="stat-card__label">Total users</p>
          <p className="stat-card__value">{new Intl.NumberFormat().format(total)}</p>
          <UserCountTrendSparkline result={trend} variant="simplelist" />
        </article>

        <div className="brewmote-recent">
          <h3 className="brewmote-subheading">Recent signups</h3>
          {recentError ? (
            <BrewmoteStateCallout variant="error" title="Could not load recent signups">
              {recentError}
            </BrewmoteStateCallout>
          ) : recent.length === 0 ? (
            <BrewmoteStateCallout variant="empty" title="No recent users in this window">
              The first page of Auth users was empty, or sorting returned nothing.
            </BrewmoteStateCallout>
          ) : (
            <ul className="signup-list">
              {recent.map((u) => (
                <li key={u.id} className="signup-list__item signup-list__item--stack">
                  <span className="signup-list__email">{u.email ?? "—"}</span>
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
