"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { updateAccountProfile } from "@/app/(client)/actions";

export function AccountForm({
  firstName,
  lastName,
  email,
}: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateAccountProfile({
        firstName: String(form.get("firstName") || ""),
        lastName: String(form.get("lastName") || ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">Profile updated.</div> : null}
      <div className="form-field">
        <label htmlFor="firstName">First name</label>
        <input id="firstName" name="firstName" className="form-control" defaultValue={firstName} required />
      </div>
      <div className="form-field">
        <label htmlFor="lastName">Last name</label>
        <input id="lastName" name="lastName" className="form-control" defaultValue={lastName} required />
      </div>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" className="form-control" value={email} disabled readOnly />
        <span className="hint">Contact Romero Digital Labs if you need to change your email.</span>
      </div>
      <button className="btn" type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
