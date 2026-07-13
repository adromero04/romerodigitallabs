"use client";

import { useEffect } from "react";

export default function AdminError({
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
      <h2 className="page-title">Admin page error</h2>
      <p className="muted">Something went wrong loading this admin screen.</p>
      <button className="btn" type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
