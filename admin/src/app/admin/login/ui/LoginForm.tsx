"use client";

import { safeAdminNextPath } from "@/lib/auth/safeAdminNext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeAdminNextPath(searchParams.get("next"));
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        setError(res.status === 401 ? "Invalid password" : "Could not sign in");
        setPending(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Network error");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ marginTop: "1.5rem" }}>
      <label htmlFor="password" className="muted" style={{ display: "block", marginBottom: "0.35rem" }}>
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={pending}
        required
      />
      {error ? (
        <p style={{ color: "#f88", marginTop: "0.75rem", marginBottom: 0 }} role="alert">
          {error}
        </p>
      ) : null}
      <div style={{ marginTop: "1rem" }}>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}
