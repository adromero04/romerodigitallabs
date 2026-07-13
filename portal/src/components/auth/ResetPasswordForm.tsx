"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string().min(8, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function prepareSession() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!cancelled) {
            setSessionError(
              "This reset link is invalid or has expired. Request a new one from Forgot password.",
            );
          }
          return;
        }
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!cancelled) {
        if (!session) {
          setSessionError(
            "Open the reset link from your email on this device, or request a new reset link.",
          );
        } else {
          setReady(true);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && !cancelled) {
        setSessionError(null);
        setReady(true);
      }
    });

    void prepareSession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your password.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?reset=1");
    router.refresh();
  }

  if (sessionError) {
    return (
      <div className="alert alert-error" role="alert">
        {sessionError}
        <p className="auth-footer" style={{ marginBottom: 0 }}>
          <Link href="/forgot-password">Request a new reset link</Link>
        </p>
      </div>
    );
  }

  if (!ready) {
    return <p className="muted">Checking your reset link…</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {error ? (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      ) : null}
      <div className="form-field">
        <label htmlFor="password">New password</label>
        <input
          id="password"
          className="form-control"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="confirm">Confirm password</label>
        <input
          id="confirm"
          className="form-control"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
        {loading ? "Updating…" : "Update password"}
      </button>
      <p className="auth-footer">
        <Link href="/login">Back to sign in</Link>
      </p>
    </form>
  );
}
