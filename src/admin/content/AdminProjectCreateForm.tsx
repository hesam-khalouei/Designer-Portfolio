import { useState, type FormEvent } from "react";
import type { AppDependencies } from "../../app/bootstrap/createAppDependencies";
import type { CreateProjectDraftInput } from "../../domain/content/entities/ProjectDraft";
import type { DeviceType } from "../../domain/content/entities/PortfolioContent";
import type { Lang } from "../../domain/localization/LocalizedText";
import { ProjectDraftError } from "../../application/errors/ProjectDraftError";
import { AdminButton } from "../design-system/AdminButton";
import { AdminCard } from "../design-system/AdminCard";
import { AdminInput } from "../design-system/AdminInput";

type Props = {
  projectDrafts: Pick<AppDependencies["projectDrafts"], "create">;
  locale: Lang;
  onCreated: () => Promise<void>;
};

const devices: DeviceType[] = [
  "phone", "laptop", "tablet", "browser", "monitor", "multi",
];

const labels: Record<Lang, Record<string, string>> = {
  en: {
    title: "Create new project",
    id: "Project ID (unique)",
    name: "Project name",
    device: "Device",
    initialLocale: "Initial content language",
    category: "Category",
    sector: "Sector",
    sortOrder: "Display order",
    create: "Create project",
    creating: "Creating...",
    success: "Project created successfully.",
    duplicate: "This project ID already exists.",
    invalid: "Please check the entered information.",
    failure: "Could not create project. Please try again.",
  },
  fa: {
    title: "ایجاد پروژه جدید",
    id: "شناسه پروژه (یکتا)",
    name: "نام پروژه",
    device: "دستگاه",
    initialLocale: "زبان اولیه محتوا",
    category: "دسته‌بندی",
    sector: "حوزه فعالیت",
    sortOrder: "ترتیب نمایش",
    create: "ایجاد پروژه",
    creating: "در حال ایجاد...",
    success: "پروژه با موفقیت ایجاد شد.",
    duplicate: "این شناسه پروژه قبلاً استفاده شده است.",
    invalid: "اطلاعات واردشده را بررسی کن.",
    failure: "ایجاد پروژه ناموفق بود. دوباره تلاش کن.",
  },
  ar: {
    title: "إنشاء مشروع جديد",
    id: "معرّف المشروع (فريد)",
    name: "اسم المشروع",
    device: "الجهاز",
    initialLocale: "لغة المحتوى الأولية",
    category: "الفئة",
    sector: "مجال العمل",
    sortOrder: "ترتيب العرض",
    create: "إنشاء المشروع",
    creating: "جارٍ الإنشاء...",
    success: "تم إنشاء المشروع بنجاح.",
    duplicate: "معرّف المشروع مستخدم بالفعل.",
    invalid: "يرجى التحقق من البيانات المدخلة.",
    failure: "تعذر إنشاء المشروع. حاول مرة أخرى.",
  },
};

export function AdminProjectCreateForm({
  projectDrafts,
  locale,
  onCreated,
}: Props) {
  const t = labels[locale];
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [device, setDevice] = useState<DeviceType>("browser");
  const [initialLocale, setInitialLocale] = useState<Lang>(locale);
  const [category, setCategory] = useState("");
  const [sector, setSector] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const normalizedId = projectId.trim().toLowerCase();
    const normalizedName = name.trim();
    const order = Number(sortOrder);

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedId) ||
      !normalizedName ||
      !Number.isInteger(order) ||
      order < 0
    ) {
      setError(t.invalid);
      setNotice("");
      return;
    }

    const input: CreateProjectDraftInput = {
      projectId: normalizedId,
      initialLocale,
      sortOrder: order,
      shared: { name: normalizedName, device },
      localized: {
        ...(category.trim() ? { category: category.trim() } : {}),
        ...(sector.trim() ? { sector: sector.trim() } : {}),
      },
    };

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await projectDrafts.create.execute(input);
      setProjectId("");
      setName("");
      setDevice("browser");
      setCategory("");
      setSector("");
      setSortOrder("0");
      setNotice(t.success);
      await onCreated();
    } catch (cause) {
      setError(
        cause instanceof ProjectDraftError
          ? cause.code === "ALREADY_EXISTS"
            ? t.duplicate
            : cause.code === "INVALID_INPUT"
              ? t.invalid
              : t.failure
          : t.failure,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminCard className="admin-editor-card">
      <form className="admin-project-editor" onSubmit={handleSubmit}>
        <h3>{t.title}</h3>

        <AdminInput
          id="new-project-id"
          label={t.id}
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          placeholder="my-new-project"
          required
        />

        <AdminInput
          id="new-project-name"
          label={t.name}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="new-project-device">
            {t.device}
          </label>
          <select
            id="new-project-device"
            className="admin-input"
            value={device}
            onChange={(event) => setDevice(event.target.value as DeviceType)}
          >
            {devices.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="new-project-locale">
            {t.initialLocale}
          </label>
          <select
            id="new-project-locale"
            className="admin-input"
            value={initialLocale}
            onChange={(event) => setInitialLocale(event.target.value as Lang)}
          >
            <option value="en">English</option>
            <option value="fa">فارسی</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <AdminInput
          id="new-project-category"
          label={t.category}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />

        <AdminInput
          id="new-project-sector"
          label={t.sector}
          value={sector}
          onChange={(event) => setSector(event.target.value)}
        />

        <AdminInput
          id="new-project-sort-order"
          label={t.sortOrder}
          type="number"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          required
        />

        <AdminButton type="submit" disabled={saving}>
          {saving ? t.creating : t.create}
        </AdminButton>

        {notice && <p role="status">{notice}</p>}
        {error && <p role="alert">{error}</p>}
      </form>
    </AdminCard>
  );
}
