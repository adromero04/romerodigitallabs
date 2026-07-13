import type { CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

type Props = {
  value: string;
  label?: string;
};

export function StatusBadge({ value, label }: Props) {
  return <span className={`badge badge-${value}`}>{label ?? value.replaceAll("_", " ")}</span>;
}

export function ProgressBar({ percent }: { percent: number }) {
  const safe = Math.max(0, Math.min(100, percent));
  const style = { "--progress": `${safe}%` } as CSSProperties;
  return (
    <div className="progress" role="progressbar" aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100} aria-label={`${safe}% complete`}>
      <div className="progress-fill" style={style} />
      <span className="progress-label">{safe}%</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon = "inbox",
  action,
}: {
  title: string;
  description: string;
  icon?: IconName;
  action?: ReactNode;
}) {
  return (
    <div className="panel empty-state">
      <Icon name={icon} size={40} className="nav-icon" />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="summary-card panel">
      <div className="summary-card-label">{label}</div>
      <div className="summary-card-value">{value}</div>
      {hint ? <div className="muted" style={{ marginTop: "0.35rem", fontSize: "0.85rem" }}>{hint}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <h2 className="page-title">{title}</h2>
        {description ? <p className="muted" style={{ margin: "0.35rem 0 0" }}>{description}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  );
}
