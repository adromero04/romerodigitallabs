import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";

export const metadata = { title: "Accept invite" };

export default function AcceptInvitePage() {
  return (
    <>
      <h1>Welcome</h1>
      <p className="lead">Finish setting up your Romero Digital Labs client portal account.</p>
      <AcceptInviteForm />
    </>
  );
}
