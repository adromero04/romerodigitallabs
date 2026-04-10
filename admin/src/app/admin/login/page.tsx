/**
 * Password gate for the private dashboard.
 * Successful login sets an HTTP-only JWT cookie; middleware enforces it on `/admin` and `/api/admin`.
 */
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "./ui/LoginForm";

export default function AdminLoginPage() {
  return (
    <main style={{ maxWidth: 420, marginTop: "3rem" }}>
      <p className="admin-login-logo-wrap">
        <Image
          src="/img/icon-color.png"
          alt="Brewmote"
          width={165}
          height={150}
          className="admin-login-logo"
          priority
        />
      </p>
      <h1 style={{ marginTop: 0 }}>Admin sign in</h1>
      <p className="muted">Romero Digital Labs — internal dashboard only.</p>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
