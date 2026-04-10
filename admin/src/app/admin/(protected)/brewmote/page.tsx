import Link from "next/link";
import { Suspense } from "react";
import { BrewmoteCafesSection } from "@/components/brewmote/BrewmoteCafesSection";
import { BrewmoteReviewsSection } from "@/components/brewmote/BrewmoteReviewsSection";
import { BrewmoteSearchPanel } from "@/components/brewmote/BrewmoteSearchPanel";
import { BrewmoteUsersSection } from "@/components/brewmote/BrewmoteUsersSection";
import { BrewmotePanelSkeleton, BrewmoteStatSkeleton } from "@/components/brewmote/brewmote-skeletons";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ userEmail?: string; cafeName?: string }>;
};

export default async function BrewmoteAdminPage({ searchParams }: PageProps) {
  const { userEmail, cafeName } = await searchParams;

  return (
    <div className="admin-page brewmote-page">
      <header className="admin-page-head">
        <p className="admin-kicker">Brewmote</p>
        <h1 className="admin-page-title">Brewmote workspace</h1>
        <p className="admin-page-lead muted">Metrics and search for the Brewmote project.</p>
        <p className="muted" style={{ marginTop: "-0.5rem" }}>
          API health:{" "}
          <Link href="/api/admin/brewmote/health" className="admin-inline-link">
            /api/admin/brewmote/health
          </Link>
        </p>
      </header>

      <Suspense fallback={<BrewmotePanelSkeleton rows={5} />}>
        <BrewmoteUsersSection />
      </Suspense>

      <Suspense fallback={<BrewmoteStatSkeleton />}>
        <BrewmoteCafesSection />
      </Suspense>

      <Suspense fallback={<BrewmotePanelSkeleton rows={2} />}>
        <BrewmoteReviewsSection />
      </Suspense>

      <BrewmoteSearchPanel userEmail={userEmail} cafeName={cafeName} />
    </div>
  );
}
