import Link from "next/link";
import { UserCountTrendSparkline } from "@/components/admin/UserCountTrendSparkline";
import { formatAdminDateTime } from "@/lib/formatAdmin";
import { getCombinedUserTrend, type DashboardSnapshot } from "@/server/dashboardOverview";

function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

type Props = { snapshot: DashboardSnapshot };

export function DashboardOverview({ snapshot }: Props) {
  const {
    simpleListIntegrationConfigured,
    brewmoteUsers,
    simpleListUsers,
    brewmoteUserTrend,
    simpleListUserTrend,
    recentSignups,
  } = snapshot;

  const combined = simpleListIntegrationConfigured
    ? brewmoteUsers.ok && simpleListUsers.ok
      ? brewmoteUsers.value + simpleListUsers.value
      : null
    : brewmoteUsers.ok
      ? brewmoteUsers.value
      : null;
  const combinedTrend = getCombinedUserTrend(brewmoteUserTrend, simpleListUserTrend);

  return (
    <div className="admin-dashboard">
      <header className="admin-page-head">
        <p className="admin-kicker">Dashboard</p>
        <h1 className="admin-page-title">Control center</h1>
        <p className="admin-page-lead muted">
          {simpleListIntegrationConfigured
            ? "Live totals for Brewmote and SimpleList. Each card shows how user counts grew over the last 30 days and how new signups compare to the 30 days before."
            : "Brewmote totals and trends; SimpleList is not configured on this server."}
        </p>
      </header>

      <section className="admin-section" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="admin-section-title">
          Overview
        </h2>
        <div className="stats-grid">
          <article className="stat-card stat-card--brewmote">
            <p className="stat-card__label">Brewmote users</p>
            <p className="stat-card__value">
              {brewmoteUsers.ok ? formatNumber(brewmoteUsers.value) : "—"}
            </p>
            {!brewmoteUsers.ok ? <p className="stat-card__err muted">{brewmoteUsers.message}</p> : null}
            <UserCountTrendSparkline result={brewmoteUserTrend} variant="brewmote" />
          </article>
          <article className="stat-card stat-card--simplelist">
            <p className="stat-card__label">SimpleList users</p>
            <p className="stat-card__value">
              {simpleListUsers.ok ? formatNumber(simpleListUsers.value) : "—"}
            </p>
            {!simpleListUsers.ok ? (
              <p className={simpleListIntegrationConfigured ? "stat-card__err muted" : "stat-card__hint muted"}>
                {simpleListUsers.message}
              </p>
            ) : null}
            <UserCountTrendSparkline result={simpleListUserTrend} variant="simplelist" />
          </article>
          <article className="stat-card stat-card--combined">
            <p className="stat-card__label">Combined total</p>
            <p className="stat-card__value stat-card__value--accent">
              {combined !== null ? formatNumber(combined) : "—"}
            </p>
            {combined === null ? (
              <p className="stat-card__hint muted">
                {simpleListIntegrationConfigured
                  ? "Both projects must load to sum."
                  : "Brewmote must load to show the total."}
              </p>
            ) : null}
            <UserCountTrendSparkline result={combinedTrend} variant="combined" />
          </article>
        </div>
      </section>

      <div className="dashboard-two-col">
        <section className="admin-section panel-block" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="admin-section-title">
            Recent signups
          </h2>
          <p className="muted admin-section-desc">
            {simpleListIntegrationConfigured
              ? "Newest Brewmote signups first. SimpleList shows the most recent accounts from its directory."
              : "Brewmote signups only; SimpleList is not configured."}
          </p>
          {recentSignups.length === 0 ? (
            <p className="muted">Nothing to show yet, or the connection failed.</p>
          ) : (
            <ul className="signup-list">
              {recentSignups.map((row) => (
                <li key={row.id} className="signup-list__item">
                  <span className={`signup-badge signup-badge--${row.source}`}>{row.source}</span>
                  <span className="signup-list__email">{row.email ?? "—"}</span>
                  <span className="signup-list__date muted">{formatAdminDateTime(row.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-section panel-block" aria-labelledby="links-heading">
          <h2 id="links-heading" className="admin-section-title">
            Quick links
          </h2>
          <ul className="quick-links">
            <li>
              <Link className="quick-link" href="/admin/brewmote">
                <span>Brewmote</span>
                <span className="quick-link__arrow" aria-hidden>
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link className="quick-link" href="/admin/simplelist">
                <span>SimpleList</span>
                <span className="quick-link__arrow" aria-hidden>
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link className="quick-link" href="/admin/combined">
                <span>Combined overview</span>
                <span className="quick-link__arrow" aria-hidden>
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link className="quick-link" href="/admin/settings">
                <span>Settings</span>
                <span className="quick-link__arrow" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <section className="admin-section" aria-labelledby="hubs-heading">
        <h2 id="hubs-heading" className="admin-section-title">
          Sections
        </h2>
        <div className="hub-grid">
          <article className="hub-card">
            <h3 className="hub-card__title">Brewmote</h3>
            <p className="hub-card__text muted">Tools and data for the Brewmote Supabase project.</p>
            <Link href="/admin/brewmote" className="hub-card__cta">
              Open Brewmote →
            </Link>
          </article>
          <article className="hub-card">
            <h3 className="hub-card__title">SimpleList</h3>
            <p className="hub-card__text muted">Tools and data for the SimpleList Supabase project.</p>
            <Link href="/admin/simplelist" className="hub-card__cta">
              Open SimpleList →
            </Link>
          </article>
          <article className="hub-card">
            <h3 className="hub-card__title">Combined overview</h3>
            <p className="hub-card__text muted">Cross-app totals and comparison in one place.</p>
            <Link href="/admin/combined" className="hub-card__cta">
              Open combined →
            </Link>
          </article>
          <article className="hub-card">
            <h3 className="hub-card__title">Settings</h3>
            <p className="hub-card__text muted">Session, environment, and operational notes.</p>
            <Link href="/admin/settings" className="hub-card__cta">
              Open settings →
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
