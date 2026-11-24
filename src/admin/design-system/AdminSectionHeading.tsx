export type AdminSectionHeadingProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  level?: "h2" | "h3";
};

export function AdminSectionHeading({
  title,
  description,
  eyebrow,
  level = "h2",
}: AdminSectionHeadingProps) {
  const HeadingTag = level;

  return (
    <div className="admin-section-heading">
      {eyebrow && (
        <span className="admin-section-heading-eyebrow">
          {eyebrow}
        </span>
      )}

      <HeadingTag className="admin-section-heading-title">
        {title}
      </HeadingTag>

      {description && (
        <p className="admin-section-heading-description">
          {description}
        </p>
      )}
    </div>
  );
}
