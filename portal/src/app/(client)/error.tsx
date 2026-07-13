"use client";

import { useEffect } from "react";

export default function ClientError({
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
    <div className="panel">
      <h2 className="page-title">Could not load this page</h2>
      <p className="muted">Please try again. If it keeps failing, contact Romero Digital Labs.</p>
      <button className="btn" type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
