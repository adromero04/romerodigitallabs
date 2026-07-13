"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export type TabItem = { href: string; label: string };

export function ProjectTabs({ tabs }: { tabs: TabItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("tab") ?? "overview";

  return (
    <nav className="project-tabs" aria-label="Project sections">
      {tabs.map((tab) => {
        const tabKey = new URL(tab.href, "http://local").searchParams.get("tab") ?? "overview";
        const active = current === tabKey || (pathname.includes(tab.href.split("?")[0]) && tab.href.includes(`tab=${current}`));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`project-tab${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
