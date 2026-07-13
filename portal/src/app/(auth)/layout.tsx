import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-page">
      <div className="panel auth-card">
        <Link href="/login" className="auth-brand">
          <img
            src="/img/logo-blk.png"
            alt="Romero Digital Labs"
            className="auth-brand-logo"
          />
        </Link>
        {children}
      </div>
    </div>
  );
}
