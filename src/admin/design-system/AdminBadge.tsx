import type { HTMLAttributes, ReactNode } from "react";

export type AdminBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "warning" | "danger";
  children: ReactNode;
};

export function AdminBadge({
  tone = "neutral",
  children,
  className = "",
  ...props
}: AdminBadgeProps) {
  const classes = [
    "admin-badge",
    `admin-badge--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
