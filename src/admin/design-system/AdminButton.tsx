import type { ButtonHTMLAttributes, ReactNode } from "react";

export type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  children: ReactNode;
};

export function AdminButton({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...props
}: AdminButtonProps) {
  const classes = [
    "admin-button",
    `admin-button--${variant}`,
    `admin-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
