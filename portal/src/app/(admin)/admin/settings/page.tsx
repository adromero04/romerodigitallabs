import { PageHeader } from "@/components/ui/Primitives";

export const metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3020";
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <div className="stack">
      <PageHeader
        title="Settings"
        description="Portal configuration overview. Secrets stay in environment variables — never in the browser."
      />

      <div className="panel">
        <h3 className="section-title">Environment</h3>
        <dl className="meta-grid">
          <div>
            <dt>App URL</dt>
            <dd>{appUrl}</dd>
          </div>
          <div>
            <dt>Supabase URL</dt>
            <dd>{supabaseConfigured ? "Configured" : "Missing"}</dd>
          </div>
          <div>
            <dt>Service role key</dt>
            <dd>{serviceRoleConfigured ? "Configured (server-only)" : "Missing — invites will fail"}</dd>
          </div>
        </dl>
      </div>

      <div className="panel">
        <h3 className="section-title">Invite redirect</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Client invites use this callback so new users land on accept-invite:
        </p>
        <code style={{ display: "block", wordBreak: "break-all" }}>
          {appUrl}/auth/callback?next=/accept-invite
        </code>
        <p className="muted" style={{ marginBottom: 0 }}>
          Add that URL (and your production equivalent) to Supabase Auth redirect allow list.
        </p>
      </div>
    </div>
  );
}
