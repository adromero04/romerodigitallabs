export default function AdminLoading() {
  return (
    <div className="stack" aria-busy="true" aria-live="polite">
      <div className="skeleton-block" style={{ height: "2rem", maxWidth: "14rem" }} />
      <div className="summary-grid">
        <div className="skeleton-block panel" style={{ height: "5.5rem" }} />
        <div className="skeleton-block panel" style={{ height: "5.5rem" }} />
        <div className="skeleton-block panel" style={{ height: "5.5rem" }} />
        <div className="skeleton-block panel" style={{ height: "5.5rem" }} />
      </div>
      <div className="two-col">
        <div className="skeleton-block panel" style={{ height: "14rem" }} />
        <div className="skeleton-block panel" style={{ height: "14rem" }} />
      </div>
    </div>
  );
}
