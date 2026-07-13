"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { completeActionItem } from "@/app/(client)/actions";
import { formatDate } from "@/lib/format";
import { priorityLabels } from "@/lib/labels";
import type { ActionItemWithProject } from "@/types/database";
import { StatusBadge } from "@/components/ui/Primitives";

export function ActionItemsList({ items }: { items: ActionItemWithProject[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onComplete(id: string) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await completeActionItem(id);
      setPendingId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      {error ? (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      ) : null}
      <div className="card-list">
        {items.map((item) => (
          <div key={item.id} className="list-row">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 650 }}>{item.title}</div>
              <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                {item.projects?.name ?? "Project"} · Due {formatDate(item.due_date)} ·{" "}
                {priorityLabels[item.priority]}
              </div>
              {item.description ? (
                <p className="muted" style={{ margin: "0.4rem 0 0", fontSize: "0.9rem" }}>
                  {item.description}
                </p>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <StatusBadge value={item.status} />
              <button
                type="button"
                className="btn btn-sm"
                disabled={isPending && pendingId === item.id}
                onClick={() => onComplete(item.id)}
              >
                {isPending && pendingId === item.id ? "Saving…" : "Mark complete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
