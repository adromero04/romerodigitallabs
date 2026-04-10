import type { MetricResult } from "@/server/admin/loadResultTypes";
import { BrewmoteStateCallout } from "./BrewmoteStateCallout";

export function BrewmoteMetricBlock({ label, result }: { label: string; result: MetricResult }) {
  if (result.status === "not_configured") {
    return (
      <div className="brewmote-metric-slot">
        <h3 className="brewmote-subheading">{label}</h3>
        <BrewmoteStateCallout variant="todo" title="Not connected">
          {result.message}
        </BrewmoteStateCallout>
      </div>
    );
  }
  if (result.status === "error") {
    return (
      <div className="brewmote-metric-slot">
        <h3 className="brewmote-subheading">{label}</h3>
        <BrewmoteStateCallout variant="error" title="Couldn’t load">
          {result.message}
        </BrewmoteStateCallout>
      </div>
    );
  }
  return (
    <article className="stat-card stat-card--brewmote brewmote-metric-slot">
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{new Intl.NumberFormat().format(result.value)}</p>
    </article>
  );
}
