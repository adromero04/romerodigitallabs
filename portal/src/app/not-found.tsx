import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-shell">
      <div className="auth-card panel">
        <h1 className="page-title">Page not found</h1>
        <p className="muted">That link does not match a portal page.</p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link className="btn" href="/login">
            Sign in
          </Link>
          <Link className="btn btn-ghost" href="/">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
