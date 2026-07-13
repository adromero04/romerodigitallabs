import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Set new password" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1>Choose a new password</h1>
      <p className="lead">Enter a new password for your portal account.</p>
      <ResetPasswordForm />
    </>
  );
}
