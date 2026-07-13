"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="alert alert-success" role="status">
        If an account exists for that email, you will receive a reset link shortly.
        <p className="auth-footer" style={{ marginBottom: 0 }}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
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
        <span className="hint">We will email you a secure link to reset your password.</span>
      </div>
      <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
        {loading ? "Sending…" : "Send reset link"}
      </button>
      <p className="auth-footer">
        <Link href="/login">Back to sign in</Link>
      </p>
    </form>
  );
}
