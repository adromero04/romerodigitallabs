"use client";

import { useCallback, useEffect, useId, useState } from "react";

type ReviewRow = {
  id: string;
  cafe_id: string;
  user_id: string;
  review: string;
  created_at: string | null;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type Props = { count: number };

export function BrewmoteWrittenReviewsTrigger({ count }: Props) {
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/brewmote/written-reviews");
      const body: unknown = await res.json().catch(() => ({}));
      const err =
        body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
          ? (body as { error: string }).error
          : null;
      if (!res.ok) {
        setError(err ?? "Could not load reviews.");
        setReviews([]);
        return;
      }
      const list =
        body && typeof body === "object" && "reviews" in body && Array.isArray((body as { reviews: unknown }).reviews)
          ? ((body as { reviews: ReviewRow[] }).reviews as ReviewRow[])
          : [];
      setReviews(list);
    } catch {
      setError("Network error.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="brewmote-written-reviews-trigger stat-card stat-card--brewmote brewmote-metric-slot"
        onClick={() => {
          setOpen(true);
          void load();
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
      >
        <p className="stat-card__label">Written reviews</p>
        <p className="stat-card__value">{new Intl.NumberFormat().format(count)}</p>
        <p className="brewmote-written-reviews-trigger__hint muted">Click to open list</p>
      </button>

      {open ? (
        <div
          className="admin-modal-root"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            id={dialogId}
            className="admin-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="admin-modal-dialog__head">
              <h2 id={titleId} className="admin-modal-dialog__title">
                Written reviews
              </h2>
              <button type="button" className="admin-modal-dialog__close" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <p className="muted admin-modal-dialog__lede">Written feedback, newest first (up to 200).</p>
            <div className="admin-modal-dialog__body">
              {loading ? <p className="muted">Loading…</p> : null}
              {!loading && error ? (
                <div className="brewmote-callout brewmote-callout--error" role="alert">
                  <strong className="brewmote-callout__title">Could not load</strong>
                  <div className="brewmote-callout__body muted">{error}</div>
                </div>
              ) : null}
              {!loading && !error && reviews && reviews.length === 0 ? (
                <p className="muted">No written reviews found.</p>
              ) : null}
              {!loading && reviews && reviews.length > 0 ? (
                <ul className="brewmote-written-reviews-list">
                  {reviews.map((r) => (
                    <li key={r.id} className="brewmote-written-reviews-list__item">
                      <p className="brewmote-written-reviews-list__text">{r.review}</p>
                      <p className="brewmote-written-reviews-list__meta muted">
                        <span>Cafe {r.cafe_id}</span>
                        <span> · User {r.user_id}</span>
                        <span> · {formatWhen(r.created_at)}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
