import { AccountForm } from "@/components/account/AccountForm";
import { PageHeader, StatusBadge } from "@/components/ui/Primitives";
import { requireClient } from "@/lib/auth/session";
import { roleLabels } from "@/lib/labels";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const profile = await requireClient();

  return (
    <div className="stack">
      <PageHeader title="Account" description="Your portal profile details." />
      <div className="panel">
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <StatusBadge value={profile.role} label={roleLabels[profile.role]} />
        </div>
        <AccountForm
          firstName={profile.first_name ?? ""}
          lastName={profile.last_name ?? ""}
          email={profile.email}
        />
      </div>
    </div>
  );
}
