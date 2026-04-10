import Link from "next/link";
import { Suspense } from "react";
import { BrewmotePanelSkeleton } from "@/components/brewmote/brewmote-skeletons";
import { SimplelistSearchPanel } from "@/components/simplelist/SimplelistSearchPanel";
import { SimplelistUsersSection } from "@/components/simplelist/SimplelistUsersSection";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ userEmail?: string; listsForUser?: string }>;
};

export default async function SimpleListAdminPage({ searchParams }: PageProps) {
  const { userEmail, listsForUser } = await searchParams;

  return (
    <div className="admin-page brewmote-page">
      <header className="admin-page-head">
        <p className="admin-kicker">SimpleList</p>
        <h1 className="admin-page-title">SimpleList workspace</h1>
        <p className="admin-page-lead muted">Metrics and search for the SimpleList project.</p>
        <p className="muted" style={{ marginTop: "-0.5rem" }}>
          API health:{" "}
          <Link href="/api/admin/simplelist/health" className="admin-inline-link">
            /api/admin/simplelist/health
          </Link>
        </p>
      </header>

      <Suspense fallback={<BrewmotePanelSkeleton rows={5} />}>
        <SimplelistUsersSection />
      </Suspense>

      <SimplelistSearchPanel userEmail={userEmail} listsForUser={listsForUser} />
    </div>
  );
}
