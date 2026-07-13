import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { displayName } from "@/lib/labels";
import type { Profile } from "@/types/database";

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "space_dashboard" },
  { href: "/admin/clients", label: "Clients", icon: "groups" },
  { href: "/admin/projects", label: "Projects", icon: "work" },
  { href: "/admin/support", label: "Support", icon: "support_agent" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

type Props = {
  profile: Profile;
  title: string;
  children: React.ReactNode;
};

export function AdminShell({ profile, title, children }: Props) {
  return (
    <AppShell
      title={title}
      subtitle="Romero Digital Labs Admin"
      userLabel={displayName(profile.first_name, profile.last_name, profile.email)}
      navItems={ADMIN_NAV}
    >
      {children}
    </AppShell>
  );
}
