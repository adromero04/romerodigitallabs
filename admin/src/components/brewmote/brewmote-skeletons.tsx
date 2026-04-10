export function BrewmotePanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="brewmote-skeleton panel-block" aria-hidden>
      <div className="brewmote-skeleton__title" />
      <div className="brewmote-skeleton__bar brewmote-skeleton__bar--short" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="brewmote-skeleton__bar" />
      ))}
    </div>
  );
}

export function BrewmoteStatSkeleton() {
  return (
    <div className="brewmote-skeleton stat-card stat-card--brewmote" aria-hidden>
      <div className="brewmote-skeleton__label" />
      <div className="brewmote-skeleton__value" />
    </div>
  );
}

export function BrewmoteTableSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="brewmote-skeleton brewmote-table-skeleton" aria-hidden>
      <div className="brewmote-skeleton__row brewmote-skeleton__row--head">
        {Array.from({ length: cols }, (_, i) => (
          <div key={i} className="brewmote-skeleton__cell" />
        ))}
      </div>
      {Array.from({ length: 3 }, (_, r) => (
        <div key={r} className="brewmote-skeleton__row">
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className="brewmote-skeleton__cell" />
          ))}
        </div>
      ))}
    </div>
  );
}
