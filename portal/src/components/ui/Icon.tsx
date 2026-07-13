import type { ReactNode } from "react";

type IconName =
  | "hub"
  | "dashboard"
  | "folder"
  | "attach_file"
  | "receipt_long"
  | "support_agent"
  | "person"
  | "logout"
  | "menu"
  | "space_dashboard"
  | "groups"
  | "work"
  | "settings"
  | "add"
  | "close"
  | "check"
  | "edit"
  | "mail"
  | "inbox";

const paths: Record<IconName, ReactNode> = {
  hub: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M7 6.5 10.5 10M14 10l3.5-3.5M7 17.5 10.5 14M14 14l3.5 3.5" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </>
  ),
  space_dashboard: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </>
  ),
  folder: (
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2H18.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
  ),
  attach_file: <path d="M16 7v8.5a4 4 0 1 1-8 0V6a2.5 2.5 0 0 1 5 0v8.5a1 1 0 1 1-2 0V7" />,
  receipt_long: (
    <>
      <path d="M6 3h12v18l-2-1.2L14 21l-2-1.2L10 21l-2-1.2L6 21V3Z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  support_agent: (
    <>
      <circle cx="12" cy="10" r="3" />
      <path d="M5 19a7 7 0 0 1 14 0" />
      <path d="M4 12a2 2 0 0 0 2 2h1M18 14h1a2 2 0 0 0 2-2" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
      <path d="M14 12H22M18 8l4 4-4 4" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  groups: (
    <>
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="16" cy="9" r="2" />
      <path d="M3.5 18a5.5 5.5 0 0 1 11 0M14 18a4.5 4.5 0 0 1 6.5 0" />
    </>
  ),
  work: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  add: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="M5 12l5 5L20 7" />,
  edit: (
    <>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" />
      <path d="m12 6 4 4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
      <path d="M4 8l2.5-4h11L20 8M9 13h6" />
    </>
  ),
};

export function Icon({
  name,
  className,
  size = 20,
}: {
  name: IconName;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className ?? "nav-icon"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export type { IconName };
