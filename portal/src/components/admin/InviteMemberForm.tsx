"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { inviteClientUser } from "@/app/(admin)/admin/actions";
import type { UserRole } from "@/types/database";

export function InviteMemberForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await inviteClientUser({
        clientId,
        email: String(form.get("email") || ""),
        firstName: String(form.get("firstName") || ""),
        lastName: String(form.get("lastName") || ""),
        role: String(form.get("role") || "client_owner") as Extract<UserRole, "client_owner" | "client_member">,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Invite sent. The user will receive an email to set up their account.");
      (event.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h3 className="section-title">Invite team member</h3>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="firstName">First name</label>
          <input id="firstName" name="firstName" className="form-control" required />
        </div>
        <div className="form-field">
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" name="lastName" className="form-control" required />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="form-control" required />
        </div>
        <div className="form-field">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" className="form-control" defaultValue="client_owner">
            <option value="client_owner">Client owner</option>
            <option value="client_member">Client member</option>
          </select>
        </div>
      </div>
      <button className="btn" type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send invite"}
      </button>
    </form>
  );
}
