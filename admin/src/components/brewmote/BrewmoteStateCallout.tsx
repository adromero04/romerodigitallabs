import type { ReactNode } from "react";

type Variant = "error" | "empty" | "todo" | "info";

const variantClass: Record<Variant, string> = {
  error: "brewmote-callout brewmote-callout--error",
  empty: "brewmote-callout brewmote-callout--empty",
  todo: "brewmote-callout brewmote-callout--todo",
  info: "brewmote-callout brewmote-callout--info",
};

type Props = {
  variant: Variant;
  title: string;
  children?: ReactNode;
};

export function BrewmoteStateCallout({ variant, title, children }: Props) {
  return (
    <div className={variantClass[variant]} role={variant === "error" ? "alert" : undefined}>
      <strong className="brewmote-callout__title">{title}</strong>
      {children ? <div className="brewmote-callout__body muted">{children}</div> : null}
    </div>
  );
}
