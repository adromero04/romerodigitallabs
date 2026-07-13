import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { displayName } from "@/lib/labels";
import type { Profile } from "@/types/database";

const CLIENT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/projects", label: "Projects", icon: "folder" },
  { href: "/files", label: "Files", icon: "attach_file" },
  { href: "/billing", label: "Billing", icon: "receipt_long" },
  { href: "/support", label: "Support", icon: "support_agent" },
  { href: "/account", label: "Account", icon: "person" },
];

type Props = {
  profile: Profile;
  title: string;
  businessName?: string | null;
  children: React.ReactNode;
};

export function ClientShell({ profile, title, businessName, children }: Props) {
  const nav = CLIENT_NAV.filter((item) => {
    if (item.href === "/billing" && profile.role === "client_member") return false;
    return true;
  });

  return (
    <AppShell
      title={title}
      subtitle={businessName}
      userLabel={displayName(profile.first_name, profile.last_name, profile.email)}
      navItems={nav}
    >
      {children}
    </AppShell>
  );
}
