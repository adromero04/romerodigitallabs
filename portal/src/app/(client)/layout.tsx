import { ClientShell } from "@/components/shell/ClientShell";
import { requireClient } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireClient();
  const supabase = await createClient();

  let businessName: string | null = null;
  if (profile.client_id) {
    const { data } = await supabase
      .from("clients")
      .select("business_name")
      .eq("id", profile.client_id)
      .maybeSingle();
    businessName = data?.business_name ?? null;
  }

  return (
    <ClientShell profile={profile} title="Client portal" businessName={businessName}>
      {children}
    </ClientShell>
  );
}
