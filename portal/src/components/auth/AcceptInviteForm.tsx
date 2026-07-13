"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { homePathForRole } from "@/lib/permissions";
import type { UserRole } from "@/types/database";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string().min(8, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

export function AcceptInviteForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setSessionError("This invite link is invalid or has expired. Ask your Romero Digital Labs contact for a new invite.");
      } else {
        setReady(true);
      }
    });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ firstName, lastName, password, confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.password,
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
      },
    });

    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
        })
        .eq("id", user.id);

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      const role = (profile?.role as UserRole | undefined) ?? "client_member";
      router.push(homePathForRole(role));
      router.refresh();
      return;
    }

    setLoading(false);
    setError("Could not complete invite. Try signing in.");
  }

  if (sessionError) {
    return (
      <div className="alert alert-error" role="alert">
        {sessionError}
        <p className="auth-footer" style={{ marginBottom: 0 }}>
          <Link href="/login">Go to sign in</Link>
        </p>
      </div>
    );
  }

  if (!ready) {
    return <p className="muted">Checking your invite…</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {error ? (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      ) : null}
      <div className="form-field">
        <label htmlFor="firstName">First name</label>
        <input
          id="firstName"
          className="form-control"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="lastName">Last name</label>
        <input
          id="lastName"
          className="form-control"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="password">Choose a password</label>
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
        {loading ? "Saving…" : "Accept invite"}
      </button>
    </form>
  );
}
