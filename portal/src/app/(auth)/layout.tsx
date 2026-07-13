export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-page">
      <div className="panel auth-card">{children}</div>
    </div>
  );
}
