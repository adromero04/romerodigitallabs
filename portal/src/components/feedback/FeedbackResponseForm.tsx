"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { submitFeedbackResponse } from "@/app/(client)/actions";
import { formatDate } from "@/lib/format";
import type { FeedbackDecision, FeedbackRequestWithProject, FeedbackResponse } from "@/types/database";

const OPTIONS: { value: FeedbackDecision; label: string; hint: string }[] = [
  {
    value: "approved",
    label: "Approve",
    hint: "Looks good — ready to move forward.",
  },
  {
    value: "approved_with_minor_changes",
    label: "Approve with minor changes",
    hint: "Approve overall, with small notes.",
  },
  {
    value: "changes_requested",
    label: "Request changes",
    hint: "Needs updates before approval.",
  },
];

export function FeedbackResponseForm({
  request,
  existing,
  canApprove,
}: {
  request: FeedbackRequestWithProject;
  existing: FeedbackResponse | null;
  canApprove: boolean;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<FeedbackDecision>("approved");
  const [comments, setComments] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const needsComments = decision === "approved_with_minor_changes" || decision === "changes_requested";

  if (existing || done || request.status !== "awaiting_feedback") {
    return (
      <div className="alert alert-success" role="status">
        {existing || done
          ? "Thanks — your feedback was submitted."
          : "This feedback request is no longer awaiting a response."}
        <div style={{ marginTop: "0.75rem" }}>
          <Link className="btn btn-ghost btn-sm" href={`/projects/${request.project_id}?tab=feedback`}>
            Back to project
          </Link>
        </div>
      </div>
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (decision === "approved" && !canApprove) {
      setError("Only a client owner can submit a final approval.");
      return;
    }
    if (needsComments && !comments.trim()) {
      setError("Please add comments for this decision.");
      return;
    }
    if (decision === "approved" && !confirming) {
      setConfirming(true);
      return;
    }

    startTransition(async () => {
      const result = await submitFeedbackResponse({
        feedbackRequestId: request.id,
        decision,
        comments,
        projectId: request.project_id,
      });
      if (!result.ok) {
        setError(result.error);
        setConfirming(false);
        return;
      }
      setDone(true);
      router.refresh();
    });
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h3 className="section-title">{request.title}</h3>
      <p className="muted">
        {request.projects?.name ?? "Project"}
        {request.due_date ? ` · Due ${formatDate(request.due_date)}` : ""}
      </p>
      {request.description ? <p>{request.description}</p> : null}
      {request.review_url ? (
        <p>
          <a href={request.review_url} target="_blank" rel="noopener noreferrer">
            Open review link
          </a>
        </p>
      ) : null}

      {error ? <div className="alert alert-error">{error}</div> : null}
      {confirming ? (
        <div className="alert alert-info">
          You are about to submit a final approval. Continue?
        </div>
      ) : null}

      <div className="radio-stack" role="radiogroup" aria-label="Feedback decision">
        {OPTIONS.map((option) => (
          <label key={option.value} className="radio-option">
            <input
              type="radio"
              name="decision"
              value={option.value}
              checked={decision === option.value}
              onChange={() => {
                setDecision(option.value);
                setConfirming(false);
              }}
            />
            <span>
              <strong>{option.label}</strong>
              <div className="muted" style={{ fontSize: "0.85rem" }}>
                {option.hint}
              </div>
            </span>
          </label>
        ))}
      </div>

      <div className="form-field">
        <label htmlFor="comments">
          Comments{needsComments ? " (required)" : " (optional)"}
        </label>
        <textarea
          id="comments"
          className="form-control"
          rows={5}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          required={needsComments}
        />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button className="btn" type="submit" disabled={isPending}>
          {isPending ? "Submitting…" : confirming ? "Confirm approval" : "Submit feedback"}
        </button>
        {confirming ? (
          <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
