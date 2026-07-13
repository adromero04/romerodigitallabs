import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return (
    <>
      <h1>Client portal</h1>
      <p className="lead">Sign in with the account invited by Romero Digital Labs.</p>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </>
  );
}
