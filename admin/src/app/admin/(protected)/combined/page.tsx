import Link from "next/link";
import { UserCountTrendSparkline } from "@/components/admin/UserCountTrendSparkline";
import { formatAdminDateTime } from "@/lib/formatAdmin";
import { getCombinedUserTrend, getDashboardSnapshot } from "@/server/dashboardOverview";

function fmt(n: number) {
  return new Intl.NumberFormat().format(n);
}

export default async function CombinedOverviewPage() {
  const s = await getDashboardSnapshot();
  const slOn = s.simpleListIntegrationConfigured;
  const combined = slOn
    ? s.brewmoteUsers.ok && s.simpleListUsers.ok
      ? s.brewmoteUsers.value + s.simpleListUsers.value
      : null
    : s.brewmoteUsers.ok
      ? s.brewmoteUsers.value
      : null;
  const combinedTrend = getCombinedUserTrend(s.brewmoteUserTrend, s.simpleListUserTrend);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <p className="admin-kicker">Combined</p>
        <h1 className="admin-page-title">Cross-app overview</h1>
        <p className="admin-page-lead muted">
          {slOn
            ? "Brewmote and SimpleList side by side. Charts match the dashboard: last 30 days vs the 30 days before."
            : "Brewmote only; SimpleList is not configured. Combined totals and trend use Brewmote data."}
        </p>
      </header>

      <div className="stats-grid stats-grid--large">
        <article className="stat-card stat-card--brewmote">
          <p className="stat-card__label">Brewmote</p>
          <p className="stat-card__value">{s.brewmoteUsers.ok ? fmt(s.brewmoteUsers.value) : "—"}</p>
          {!s.brewmoteUsers.ok ? <p className="stat-card__err muted">{s.brewmoteUsers.message}</p> : null}
          <UserCountTrendSparkline result={s.brewmoteUserTrend} variant="brewmote" />
        </article>
        <article className="stat-card stat-card--simplelist">
          <p className="stat-card__label">SimpleList</p>
          <p className="stat-card__value">{s.simpleListUsers.ok ? fmt(s.simpleListUsers.value) : "—"}</p>
          {!s.simpleListUsers.ok ? (
            <p className={slOn ? "stat-card__err muted" : "stat-card__hint muted"}>{s.simpleListUsers.message}</p>
          ) : null}
          <UserCountTrendSparkline result={s.simpleListUserTrend} variant="simplelist" />
        </article>
        <article className="stat-card stat-card--combined">
          <p className="stat-card__label">{slOn ? "Total (sum)" : "Total (Brewmote)"}</p>
          <p className="stat-card__value stat-card__value--accent">{combined !== null ? fmt(combined) : "—"}</p>
          <UserCountTrendSparkline result={combinedTrend} variant="combined" />
        </article>
      </div>

      <section className="panel-block admin-section">
        <h2 className="admin-section-title">{slOn ? "Recent signups (both apps)" : "Recent signups (Brewmote)"}</h2>
        {s.recentSignups.length === 0 ? (
          <p className="muted">Nothing to show yet, or the connection failed.</p>
        ) : (
          <ul className="signup-list">
            {s.recentSignups.map((row) => (
              <li key={row.id} className="signup-list__item">
                <span className={`signup-badge signup-badge--${row.source}`}>{row.source}</span>
                <span className="signup-list__email">{row.email ?? "—"}</span>
                <span className="signup-list__date muted">{formatAdminDateTime(row.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="muted" style={{ marginTop: "1rem", marginBottom: 0 }}>
          <Link href="/admin">← Back to dashboard</Link>
        </p>
      </section>
    </div>
  );
}
