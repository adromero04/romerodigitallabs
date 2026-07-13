"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { homePathForRole } from "@/lib/permissions";
import type { UserRole } from "@/types/database";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() => {
    const err = searchParams.get("error");
    if (err === "inactive") {
      return "Your account is inactive. Contact Romero Digital Labs for help.";
    }
    if (err === "auth") {
      return "That sign-in or reset link is invalid or expired. Try again, or request a new password reset.";
    }
    if (searchParams.get("reset") === "1") {
      return null;
    }
    return null;
  });
  const [info] = useState<string | null>(() =>
    searchParams.get("reset") === "1" ? "Password updated. You can sign in with your new password." : null,
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let role: UserRole = "client_member";
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", user.id).maybeSingle();
      if (profile && !profile.is_active) {
        await supabase.auth.signOut();
        setLoading(false);
        setError("Your account is inactive. Contact Romero Digital Labs for help.");
        return;
      }
      if (profile?.role) role = profile.role as UserRole;
    }

    const next = searchParams.get("next");
    const destination =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : homePathForRole(role);

    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {info ? (
        <div className="alert alert-success" role="status">
          {info}
        </div>
      ) : null}
      {error ? (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          className="form-control"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          className="form-control"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="auth-footer">
        <Link href="/forgot-password">Forgot password?</Link>
      </p>
    </form>
  );
}
