"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon, type IconName } from "@/components/ui/Icon";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

type AppShellProps = {
  title: string;
  subtitle?: string | null;
  userLabel: string;
  navItems: NavItem[];
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, userLabel, navItems, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isCurrent(href: string) {
    if (href === "/dashboard" || href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div
        className={`sidebar-backdrop${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        id="portal-sidebar"
        className={`app-sidebar${open ? " is-open" : ""}`}
        aria-label="Main navigation"
      >
        <Link href="/" className="app-sidebar-brand" onClick={() => setOpen(false)}>
          <Icon name="hub" size={22} />
          <span>Romero Digital Labs</span>
        </Link>
        <nav className="app-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <button type="button" className="btn btn-ghost btn-sm sidebar-signout" onClick={signOut}>
          <Icon name="logout" size={18} />
          <span>Sign out</span>
        </button>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              type="button"
              className="mobile-menu-btn"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="portal-sidebar"
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name="menu" />
            </button>
            <div>
              <h1>{title}</h1>
              {subtitle ? <div className="app-header-meta">{subtitle}</div> : null}
            </div>
          </div>
          <div className="app-user">
            <div className="app-user-name">{userLabel}</div>
          </div>
        </header>
        <main id="main-content" className="app-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
