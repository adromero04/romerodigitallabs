import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <p className="admin-kicker">Settings</p>
        <h1 className="admin-page-title">Environment &amp; ops</h1>
        <p className="admin-page-lead muted">
          Reference for what this app needs to run. Never paste secrets into the browser — set them on the server or in your local env file.
        </p>
      </header>

      <div className="hub-grid hub-grid--single">
        <article className="panel-block hub-card hub-card--flat">
          <h2 className="hub-card__title" style={{ marginTop: 0 }}>
            Required variables
          </h2>
          <ul className="settings-list muted">
            <li>
              <code className="admin-code">ADMIN_PASSWORD</code>, <code className="admin-code">ADMIN_SESSION_SECRET</code>
            </li>
            <li>
              <code className="admin-code">BREWMOTE_SUPABASE_URL</code>, <code className="admin-code">BREWMOTE_SUPABASE_SERVICE_ROLE_KEY</code>
            </li>
            <li>
              <code className="admin-code">SIMPLELIST_SUPABASE_URL</code>,{" "}
              <code className="admin-code">SIMPLELIST_SUPABASE_SERVICE_ROLE_KEY</code>
            </li>
          </ul>
          <p className="muted" style={{ marginBottom: 0 }}>
            Copy the example env file in the admin folder when setting up locally, then open the <Link href="/admin">dashboard</Link>.
          </p>
        </article>
      </div>
    </div>
  );
}
