import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export const metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();
  return (
    <>
      <h1>Reset password</h1>
      <p className="lead">Enter your email and we will send a reset link.</p>
      <ForgotPasswordForm />
    </>
  );
}
