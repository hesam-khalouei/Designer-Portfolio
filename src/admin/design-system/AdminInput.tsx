import type { InputHTMLAttributes } from "react";

export type AdminInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function AdminInput({
  id,
  label,
  hint,
  error,
  className = "",
  "aria-describedby": ariaDescribedBy,
  ...props
}: AdminInputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const describedBy = [
    ariaDescribedBy,
    hintId,
    errorId,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const inputClasses = [
    "admin-input",
    error ? "admin-input--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="admin-field">
      <label className="admin-field-label" htmlFor={id}>
        {label}
      </label>

      <input
        {...props}
        id={id}
        className={inputClasses}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={describedBy}
      />

      {hint && (
        <p id={hintId} className="admin-field-hint">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="admin-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
