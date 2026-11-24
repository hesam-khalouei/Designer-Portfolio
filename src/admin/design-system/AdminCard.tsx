import type { HTMLAttributes, ReactNode } from "react";

export type AdminCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function AdminCard({
  children,
  className = "",
  ...props
}: AdminCardProps) {
  const classes = ["admin-card", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
