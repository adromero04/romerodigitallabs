import {
  loadBrewmoteCafeFeedbackWithReviewTextCount,
  loadBrewmoteReviewsCount,
} from "@/server/brewmotePageLoaders";
import { BrewmoteMetricBlock } from "./BrewmoteMetricBlock";
import { BrewmoteWrittenReviewsTrigger } from "./BrewmoteWrittenReviewsTrigger";

export async function BrewmoteReviewsSection() {
  const [allFeedback, withReviewText] = await Promise.all([
    loadBrewmoteReviewsCount(),
    loadBrewmoteCafeFeedbackWithReviewTextCount(),
  ]);

  return (
    <section className="panel-block admin-section" aria-labelledby="brewmote-reviews-heading">
      <h2 id="brewmote-reviews-heading" className="admin-section-title">
        Cafe feedback
      </h2>
      <p className="muted admin-section-desc">
        All cafe feedback rows, plus how many include written text. Click <strong>Written reviews</strong> to open the list.
      </p>

      <div className="stats-grid stats-grid--large">
        <BrewmoteMetricBlock label="All feedback" result={allFeedback} />
        {withReviewText.status === "success" ? (
          <BrewmoteWrittenReviewsTrigger count={withReviewText.value} />
        ) : (
          <BrewmoteMetricBlock label="Written reviews" result={withReviewText} />
        )}
      </div>
    </section>
  );
}
