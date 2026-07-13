export default function ClientLoading() {
  return (
    <div className="stack" aria-busy="true" aria-live="polite">
      <div className="skeleton-block" style={{ height: "2rem", maxWidth: "16rem" }} />
      <div className="summary-grid">
        <div className="skeleton-block panel" style={{ height: "5.5rem" }} />
        <div className="skeleton-block panel" style={{ height: "5.5rem" }} />
        <div className="skeleton-block panel" style={{ height: "5.5rem" }} />
        <div className="skeleton-block panel" style={{ height: "5.5rem" }} />
      </div>
      <div className="skeleton-block panel" style={{ height: "12rem" }} />
    </div>
  );
}
