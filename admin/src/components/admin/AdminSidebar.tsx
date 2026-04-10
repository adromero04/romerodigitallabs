"use client";

import { ADMIN_NAV } from "@/lib/admin/navConfig";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ symbol }: { symbol: string }) {
  return (
    <span className="material-symbols-outlined admin-nav-icon" aria-hidden>
      {symbol}
    </span>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: fixed top bar + sign out */}
      <header className="admin-mobile-header">
        <div className="admin-mobile-header__brand">
          <span className="admin-mobile-header__logo">
            <Image
              src="/img/icon-color.png"
              alt="Brewmote"
              width={165}
              height={150}
              className="admin-brand-logo__img"
              priority
            />
          </span>
          <span className="admin-mobile-header__title">Admin</span>
        </div>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="admin-mobile-header__signout">
            Sign out
          </button>
        </form>
      </header>

      {/* Desktop: left sidebar */}
      <aside id="admin-sidebar" className="admin-sidebar" aria-label="Main navigation">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">
            <Image
              src="/img/icon-color.png"
              alt="Brewmote"
              width={165}
              height={150}
              className="admin-brand-logo__img"
              priority
            />
          </span>
          <div>
            <div className="admin-sidebar__title">Admin</div>
            <div className="admin-sidebar__subtitle">Romero Digital Labs</div>
          </div>
        </div>
        <nav className="admin-sidebar__nav">
          {ADMIN_NAV.map(({ href, label, symbol }) => {
            const active = isNavActive(pathname, href);
            return (
              <Link key={href} href={href} className={`admin-nav-link${active ? " admin-nav-link--active" : ""}`}>
                <NavIcon symbol={symbol} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar__footer">
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="admin-signout">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile: fixed bottom tab bar */}
      <nav className="admin-bottom-nav" aria-label="Primary">
        {ADMIN_NAV.map(({ href, label, symbol }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`admin-bottom-nav__item${active ? " admin-bottom-nav__item--active" : ""}`}
            >
              <NavIcon symbol={symbol} />
              <span className="admin-bottom-nav__label">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
