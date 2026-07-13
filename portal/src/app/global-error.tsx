"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="auth-shell">
          <div className="auth-card panel">
            <h1 className="page-title">Something went wrong</h1>
            <p className="muted">
              The portal hit an unexpected error. Try again, or sign in again if the problem continues.
            </p>
            <button className="btn" type="button" onClick={reset}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
