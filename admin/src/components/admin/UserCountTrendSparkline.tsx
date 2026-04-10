import type { UserTrendResult } from "@/server/admin/loadResultTypes";

type Props = {
  result: UserTrendResult;
  variant: "brewmote" | "simplelist" | "combined";
};

const VB_W = 120;
const VB_H = 40;
const PAD = 3;

function seriesPath(values: number[]): { line: string; area: string } {
  if (values.length === 0) return { line: "", area: "" };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerH = VB_H - PAD * 2;
  const innerW = VB_W - PAD * 2;
  const n = values.length;
  const step = n > 1 ? innerW / (n - 1) : 0;

  const pts = values.map((v, i) => {
    const x = PAD + i * step;
    const y = PAD + innerH * (1 - (v - min) / range);
    return { x, y };
  });

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(2)} ${VB_H - PAD} L ${pts[0].x.toFixed(2)} ${VB_H - PAD} Z`;

  return { line, area };
}

export function UserCountTrendSparkline({ result, variant }: Props) {
  if (!result.ok) {
    return <p className="stat-card__trend-fail muted">{result.message}</p>;
  }

  const d = result.data;
  const { line, area } = seriesPath(d.cumulativeLast30);
  const delta = d.newSignupsLast30 - d.newSignupsPrior30;
  const deltaLabel =
    delta === 0
      ? "Same new signups as prior 30 days"
      : delta > 0
        ? `${delta.toLocaleString()} more new signups than prior 30 days`
        : `${Math.abs(delta).toLocaleString()} fewer new signups than prior 30 days`;

  const strokeClass =
    variant === "brewmote"
      ? "stat-card__trend-stroke--brewmote"
      : variant === "simplelist"
        ? "stat-card__trend-stroke--simplelist"
        : "stat-card__trend-stroke--combined";

  const fillClass =
    variant === "brewmote"
      ? "stat-card__trend-fill--brewmote"
      : variant === "simplelist"
        ? "stat-card__trend-fill--simplelist"
        : "stat-card__trend-fill--combined";

  return (
    <div className={`stat-card__trend stat-card__trend--${variant}`}>
      <p className="stat-card__trend-caption muted">Total users over the last 30 days — the line steps up when someone new signs up.</p>
      <svg
        className="stat-card__trend-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`User total trend over the last 30 days. ${deltaLabel}.`}
      >
        <title>User total trend, last 30 days</title>
        {area ? <path className={fillClass} d={area} /> : null}
        {line ? <path className={`stat-card__trend-line ${strokeClass}`} d={line} fill="none" /> : null}
      </svg>
      <p className={`stat-card__trend-delta ${delta > 0 ? "stat-card__trend-delta--up" : delta < 0 ? "stat-card__trend-delta--down" : ""}`}>
        <span className="stat-card__trend-delta-label">New signups (30d vs prior 30d)</span>
        <span className="stat-card__trend-delta-value">
          {d.newSignupsLast30.toLocaleString()} vs {d.newSignupsPrior30.toLocaleString()}
          {delta !== 0 ? (
            <span className="stat-card__trend-delta-arrow" aria-hidden>
              {delta > 0 ? " ↑" : " ↓"}
            </span>
          ) : null}
        </span>
      </p>
      {d.truncated ? (
        <p className="stat-card__trend-trunc muted">Chart may be incomplete for very large accounts.</p>
      ) : null}
    </div>
  );
}
