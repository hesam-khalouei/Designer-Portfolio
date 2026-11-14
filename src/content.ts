export type Lang = "en" | "fa" | "ar";
export type Text = [string, string, string];
export const text = (value: Text, lang: Lang) => value[lang === "en" ? 0 : lang === "fa" ? 1 : 2];
export const profile = {
  name: ["Amir Hesam Khalouei", "امیرحسام خلویی", "أمير حسام خلوي"] as Text,
  title: ["Senior Product Designer", "طراح ارشد محصول", "مصمم منتجات أول"] as Text,
  email: "hesam.khalouei8@gmail.com",
  linkedinHandle: "hesam_khalouei",
  // Add verified URLs here. Empty settings are intentionally not rendered as links.
  socials: { LinkedIn: "", Dribbble: "", Website: "" },
  phone: "",
};
export const summary: Text = [
  "Senior Product Designer with 8+ years of experience designing complex B2B and B2C digital products across FinTech, SaaS, Logistics, and E-commerce. Specialized in simplifying complex workflows through research-driven design, process mining, and scalable design systems.",
  "طراح ارشد محصول با بیش از ۸ سال تجربه در طراحی محصولات دیجیتال پیچیده B2B و B2C در حوزه‌های فین‌تک، نرم‌افزار ابری، لجستیک و تجارت الکترونیک. متخصص در ساده‌سازی جریان‌های کاری پیچیده با طراحی مبتنی بر پژوهش، فرایندکاوی و دیزاین‌سیستم‌های مقیاس‌پذیر.",
  "مصمم منتجات أول بخبرة تزيد عن ٨ سنوات في تصميم منتجات رقمية معقدة للشركات والمستهلكين في التقنية المالية والبرمجيات السحابية والخدمات اللوجستية والتجارة الإلكترونية. متخصص في تبسيط سير العمل من خلال التصميم القائم على البحث وتنقيب العمليات وأنظمة التصميم القابلة للتوسع.",
];
export type DeviceType = "phone" | "laptop" | "tablet" | "browser" | "monitor" | "multi";
export interface ProjectVisual {
  image?: string;
  secondaryImage?: string;
  imageAlt?: Text;
  device?: DeviceType;
}
export interface Project {
  id: string;
  name: string;
  category: Text;
  sector: Text;
  device: DeviceType;
  image?: string;
  secondaryImage?: string;
  imageAlt?: Text;
  caseContent?: Partial<Record<number, Text>>;
  caseMedia?: Partial<Record<number, ProjectVisual>>;
}
// Insert exported screenshots using image: '/projects/ewano.png'.
// caseContent keys match the section order in locales.ts (0–9); omit unknown facts.
// Add independent visuals with caseMedia: { 5: { image: '/projects/journey.png', device: 'browser' } }.
export const projects: Project[] = [
  {
    id: "ewano",
    name: "Ewano",
    category: [
      "Digital Banking & Financial Platform",
      "پلتفرم بانکداری دیجیتال و خدمات مالی",
      "منصة للخدمات المصرفية الرقمية والمالية",
    ],
    sector: ["FinTech", "فین‌تک", "التقنية المالية"],
    device: "phone",
  },
  {
    id: "postex",
    name: "Postex",
    category: [
      "Logistics & Shipment Management Platform",
      "پلتفرم لجستیک و مدیریت مرسولات",
      "منصة لإدارة الخدمات اللوجستية والشحن",
    ],
    sector: ["Logistics", "لجستیک", "الخدمات اللوجستية"],
    device: "laptop",
  },
  {
    id: "vardast",
    name: "Vardast",
    category: [
      "B2B & B2C Construction Marketplace Platform",
      "بازارگاه B2B و B2C صنعت ساختمان",
      "سوق لقطاع البناء للشركات والمستهلكين",
    ],
    sector: ["E-commerce", "تجارت الکترونیک", "التجارة الإلكترونية"],
    device: "multi",
  },
  {
    id: "day-dar",
    name: "Day Dar",
    category: ["Insurance Platform", "پلتفرم بیمه", "منصة للتأمين"],
    sector: ["Insurance", "بیمه", "التأمين"],
    device: "tablet",
  },
  {
    id: "mci",
    name: "MCI World Cup 2026",
    category: ["Match Prediction Platform", "پلتفرم پیش‌بینی مسابقات", "منصة لتوقع نتائج المباريات"],
    sector: ["Digital product", "محصول دیجیتال", "منتج رقمي"],
    device: "phone",
  },
  ...(
    [
      [
        "hudhudtrip",
        "HudHudTrip",
        ["Online Travel Booking Platform", "پلتفرم رزرو آنلاین سفر", "منصة لحجز السفر عبر الإنترنت"],
      ],
      [
        "conference2go",
        "Conference2go",
        [
          "Academic Conference Discovery Platform",
          "پلتفرم جست‌وجوی کنفرانس‌های علمی",
          "منصة لاكتشاف المؤتمرات الأكاديمية",
        ],
      ],
      [
        "net-pos",
        "Net Pos",
        ["Store Cash Register Platform", "پلتفرم صندوق فروشگاهی", "منصة لنقاط البيع"],
      ],
      [
        "sso",
        "SSO",
        [
          "Single Sign-On Authentication Platform",
          "پلتفرم احراز هویت یکپارچه",
          "منصة للمصادقة وتسجيل الدخول الموحد",
        ],
      ],
      [
        "kayak",
        "Kayak",
        ["Travel Metasearch Platform", "موتور فراجست‌وجوی سفر", "منصة للبحث الشامل عن السفر"],
      ],
      [
        "ronaq",
        "Ronaq",
        [
          "System Monitoring & Project Management Platform",
          "پلتفرم پایش سیستم و مدیریت پروژه",
          "منصة لمراقبة الأنظمة وإدارة المشاريع",
        ],
      ],
      [
        "icate",
        "Icate",
        [
          "International Academic Conference Platform",
          "پلتفرم کنفرانس‌های علمی بین‌المللی",
          "منصة للمؤتمرات الأكاديمية الدولية",
        ],
      ],
      [
        "it-pishkhan",
        "IT Pishkhan",
        [
          "Government Service Office Portal",
          "پرتال دفاتر خدمات دولتی",
          "بوابة لمكاتب الخدمات الحكومية",
        ],
      ],
    ] as [string, string, Text][]
  ).map(([id, name, category]) => ({
    id,
    name,
    category,
    sector: category,
    device: "browser" as DeviceType,
  })),
];
export const experiences: { company: string; role: Text; dates: Text; bullets: Text[] }[] = [
  {
    company: "EBCOM",
    role: profile.title,
    dates: ["May 2025 — Present", "مه ۲۰۲۵ — اکنون", "مايو ٢٠٢٥ — حتى الآن"],
    bullets: [
      [
        "Redesigned the core platform using process mining to optimize operational workflows, improving task completion efficiency by approximately 25%.",
        "بازطراحی پلتفرم اصلی با فرایندکاوی برای بهینه‌سازی گردش کار عملیاتی و بهبود حدود ۲۵٪ کارایی انجام وظایف.",
        "إعادة تصميم المنصة الأساسية باستخدام تنقيب العمليات لتحسين سير العمل ورفع كفاءة إنجاز المهام بنحو ٢٥٪.",
      ],
      [
        "Built and maintained a scalable company-wide design system across 5+ products, reducing design-to-development handoff time by around 30%.",
        "ساخت و نگهداری دیزاین‌سیستم مقیاس‌پذیر برای بیش از ۵ محصول و کاهش حدود ۳۰٪ زمان تحویل طراحی به توسعه.",
        "بناء وصيانة نظام تصميم قابل للتوسع لأكثر من ٥ منتجات، مما خفض وقت تسليم التصميم للتطوير بنحو ٣٠٪.",
      ],
      [
        "Collaborated with Product Managers, Engineers, and Operations leaders to prioritize roadmap initiatives aligned with measurable business outcomes.",
        "همکاری با مدیران محصول، مهندسان و مدیران عملیات برای اولویت‌بندی نقشه راه بر اساس نتایج قابل‌اندازه‌گیری کسب‌وکار.",
        "التعاون مع مديري المنتجات والمهندسين وقادة العمليات لتحديد أولويات خارطة الطريق بما يتوافق مع نتائج أعمال قابلة للقياس.",
      ],
    ],
  },
  {
    company: "Postex",
    role: profile.title,
    dates: ["Oct 2024 — Apr 2025", "اکتبر ۲۰۲۴ — آوریل ۲۰۲۵", "أكتوبر ٢٠٢٤ — أبريل ٢٠٢٥"],
    bullets: [
      [
        "Led the redesign of the core web platform and internal operations dashboard.",
        "رهبری بازطراحی پلتفرم وب اصلی و داشبورد عملیات داخلی.",
        "قيادة إعادة تصميم منصة الويب الأساسية ولوحة العمليات الداخلية.",
      ],
      [
        "Applied process mining to logistics workflows, reducing dispatch task time by approximately 20%.",
        "استفاده از فرایندکاوی در گردش کار لجستیک و کاهش حدود ۲۰٪ زمان وظایف ارسال.",
        "تطبيق تنقيب العمليات على سير العمل اللوجستي وخفض وقت مهام الإرسال بنحو ٢٠٪.",
      ],
      [
        "Worked with Engineering and Operations to improve routing experiences and operational efficiency; aligned stakeholders through early discovery and requirement validation.",
        "همکاری با مهندسی و عملیات برای بهبود مسیریابی و بهره‌وری؛ هم‌راستاسازی ذی‌نفعان با کشف اولیه و اعتبارسنجی نیازمندی‌ها.",
        "التعاون مع الهندسة والعمليات لتحسين تجارب التوجيه والكفاءة؛ ومواءمة أصحاب المصلحة عبر الاستكشاف المبكر والتحقق من المتطلبات.",
      ],
    ],
  },
  {
    company: "Vardast",
    role: ["Product Design Lead", "راهبر طراحی محصول", "قائد تصميم المنتجات"],
    dates: ["Apr 2023 — Aug 2024", "آوریل ۲۰۲۳ — اوت ۲۰۲۴", "أبريل ٢٠٢٣ — أغسطس ٢٠٢٤"],
    bullets: [
      [
        "Conducted stakeholder interviews with business and sales teams to identify product opportunities.",
        "مصاحبه با تیم‌های کسب‌وکار و فروش برای شناسایی فرصت‌های محصول.",
        "إجراء مقابلات مع فرق الأعمال والمبيعات لتحديد فرص المنتج.",
      ],
      [
        "Redesigned seller onboarding and product listing journeys, reducing estimated onboarding drop-off by approximately 15%.",
        "بازطراحی مسیر ورود فروشندگان و درج محصول و کاهش تخمینی حدود ۱۵٪ ریزش فرایند ورود.",
        "إعادة تصميم رحلات انضمام البائعين وإدراج المنتجات، وخفض التسرب المقدر أثناء الانضمام بنحو ١٥٪.",
      ],
      [
        "Designed scalable marketplace UI components to accelerate feature delivery and improve consistency.",
        "طراحی کامپوننت‌های مقیاس‌پذیر بازارگاه برای تسریع توسعه قابلیت‌ها و بهبود یکپارچگی.",
        "تصميم مكونات واجهة قابلة للتوسع لتسريع تقديم الميزات وتحسين الاتساق.",
      ],
    ],
  },
  {
    company: "ITSaaz",
    role: ["Product Designer", "طراح محصول", "مصمم منتجات"],
    dates: ["Nov 2021 — Mar 2023", "نوامبر ۲۰۲۱ — مارس ۲۰۲۳", "نوفمبر ٢٠٢١ — مارس ٢٠٢٣"],
    bullets: [
      [
        "Built and scaled the first company design system, improving UI consistency and increasing design efficiency by 40%.",
        "ساخت و گسترش اولین دیزاین‌سیستم شرکت و بهبود یکپارچگی رابط و افزایش ۴۰٪ کارایی طراحی.",
        "بناء وتوسيع أول نظام تصميم للشركة، مما حسّن اتساق الواجهات ورفع كفاءة التصميم بنسبة ٤٠٪.",
      ],
      [
        "Conducted usability testing and UX research, reducing friction across critical user flows by 12%.",
        "اجرای تست کاربردپذیری و تحقیقات تجربه کاربر و کاهش ۱۲٪ اصطکاک مسیرهای کلیدی.",
        "إجراء اختبارات قابلية الاستخدام وبحوث تجربة المستخدم، مما خفض الاحتكاك في المسارات الأساسية بنسبة ١٢٪.",
      ],
      [
        "Collaborated with Product Managers and Engineers across multiple initiatives.",
        "همکاری با مدیران محصول و مهندسان در پروژه‌های متعدد.",
        "التعاون مع مديري المنتجات والمهندسين في مبادرات متعددة.",
      ],
    ],
  },
  {
    company: "Standard",
    role: ["UI/UX Designer", "طراح UI/UX", "مصمم واجهات وتجربة مستخدم"],
    dates: ["Oct 2019 — Oct 2021", "اکتبر ۲۰۱۹ — اکتبر ۲۰۲۱", "أكتوبر ٢٠١٩ — أكتوبر ٢٠٢١"],
    bullets: [
      [
        "Designed responsive web applications and dashboards from discovery through high-fidelity prototypes.",
        "طراحی اپلیکیشن‌های وب واکنش‌گرا و داشبوردها از کشف تا نمونه‌های با جزئیات بالا.",
        "تصميم تطبيقات ويب متجاوبة ولوحات معلومات من الاستكشاف إلى النماذج عالية الدقة.",
      ],
      [
        "Validated design decisions with Product Managers and Developers through iterative feedback and usability testing.",
        "اعتبارسنجی تصمیمات طراحی با مدیران محصول و توسعه‌دهندگان از طریق بازخورد تکرارشونده و تست کاربردپذیری.",
        "التحقق من قرارات التصميم مع مديري المنتجات والمطورين عبر الملاحظات المتكررة واختبارات قابلية الاستخدام.",
      ],
    ],
  },
  {
    company: "Freelance",
    role: ["UI/UX Designer", "طراح UI/UX", "مصمم واجهات وتجربة مستخدم"],
    dates: ["Jul 2017 — Sep 2019", "ژوئیه ۲۰۱۷ — سپتامبر ۲۰۱۹", "يوليو ٢٠١٧ — سبتمبر ٢٠١٩"],
    bullets: [
      [
        "Delivered end-to-end UI/UX solutions for startups and small businesses across multiple industries.",
        "ارائه راهکارهای جامع UI/UX به استارتاپ‌ها و کسب‌وکارهای کوچک در صنایع مختلف.",
        "تقديم حلول متكاملة للواجهات وتجربة المستخدم للشركات الناشئة والصغيرة في قطاعات مختلفة.",
      ],
      [
        "Led discovery, wireframing, prototyping, and client presentations.",
        "رهبری کشف، وایرفریم، نمونه‌سازی و ارائه به مشتری.",
        "قيادة الاستكشاف والتخطيط الهيكلي والنمذجة الأولية والعروض للعملاء.",
      ],
    ],
  },
];
export const metrics: { value: string; company: string; label: Text; detail: Text }[] = [
  {
    value: "+40%",
    company: "ITSaaz",
    label: ["Design efficiency", "کارایی طراحی", "كفاءة التصميم"],
    detail: [
      "Improved UI consistency and design efficiency through a company-wide design system.",
      "بهبود یکپارچگی رابط کاربری و کارایی طراحی با دیزاین‌سیستم سراسری شرکت.",
      "تحسين اتساق الواجهات وكفاءة التصميم عبر نظام تصميم على مستوى الشركة.",
    ],
  },
  {
    value: "−12%",
    company: "ITSaaz",
    label: ["Journey friction", "اصطکاک مسیر کاربر", "الاحتكاك في رحلات المستخدم"],
    detail: [
      "Reduced friction in key journeys through UX research, usability testing, and iteration.",
      "کاهش اصطکاک مسیرهای کلیدی با پژوهش، تست کاربردپذیری و بهبود مستمر.",
      "خفض الاحتكاك في المسارات الأساسية عبر البحث واختبارات قابلية الاستخدام والتحسين المتكرر.",
    ],
  },
  {
    value: "−30%",
    company: "EBCOM",
    label: ["Handoff time", "زمان تحویل به توسعه", "وقت التسليم للتطوير"],
    detail: [
      "Around 30% less design-to-development handoff time with a centralized design system.",
      "کاهش حدود ۳۰٪ زمان تحویل طراحی به توسعه با دیزاین‌سیستم متمرکز.",
      "خفض وقت تسليم التصميم للتطوير بنحو ٣٠٪ باستخدام نظام تصميم مركزي.",
    ],
  },
  {
    value: "−15%",
    company: "Vardast",
    label: ["Onboarding drop-off", "ریزش فرایند ورود", "التسرب أثناء الانضمام"],
    detail: [
      "Approximately 15% reduction in estimated seller onboarding drop-off through journey redesign.",
      "کاهش تخمینی حدود ۱۵٪ ریزش ورود فروشندگان با بازطراحی مسیر.",
      "انخفاض بنحو ١٥٪ في التسرب المقدر أثناء انضمام البائعين عبر إعادة تصميم الرحلة.",
    ],
  },
  {
    value: "+25%",
    company: "EBCOM",
    label: ["Task efficiency", "کارایی انجام وظایف", "كفاءة إنجاز المهام"],
    detail: [
      "Approximately 25% improvement in task completion efficiency through process mining.",
      "بهبود حدود ۲۵٪ کارایی انجام وظایف با فرایندکاوی.",
      "تحسين كفاءة إنجاز المهام بنحو ٢٥٪ عبر تنقيب العمليات.",
    ],
  },
  {
    value: "−20%",
    company: "Postex",
    label: ["Dispatch task time", "زمان وظایف ارسال", "وقت مهام الإرسال"],
    detail: [
      "Approximately 20% less dispatch task time through logistics workflow optimization.",
      "کاهش حدود ۲۰٪ زمان وظایف ارسال با بهینه‌سازی گردش کار لجستیک.",
      "خفض وقت مهام الإرسال بنحو ٢٠٪ عبر تحسين سير العمل اللوجستي.",
    ],
  },
];
export const capabilities: { title: Text; skills: Text[] }[] = [
  {
    title: ["Product", "محصول", "المنتج"],
    skills: [
      ["Product Strategy", "استراتژی محصول", "استراتيجية المنتج"],
      ["Product Discovery", "کشف محصول", "استكشاف المنتج"],
      ["UX Research", "تحقیقات تجربه کاربر", "بحوث تجربة المستخدم"],
      ["Usability Testing", "تست کاربردپذیری", "اختبارات قابلية الاستخدام"],
      ["A/B Testing", "تست A/B", "اختبارات A/B"],
      ["Information Architecture", "معماری اطلاعات", "هندسة المعلومات"],
      ["Journey Mapping", "نقشه سفر کاربر", "رسم رحلات المستخدم"],
    ],
  },
  {
    title: ["Design", "طراحی", "التصميم"],
    skills: [
      ["Design Systems", "دیزاین‌سیستم", "أنظمة التصميم"],
      ["User Flows", "جریان‌های کاربر", "مسارات المستخدم"],
      ["Design Thinking", "تفکر طراحی", "التفكير التصميمي"],
      ["Interaction Design", "طراحی تعامل", "تصميم التفاعل"],
      ["Wireframing", "وایرفریم", "التخطيط الهيكلي"],
      ["Prototyping", "نمونه‌سازی", "النمذجة الأولية"],
      ["Responsive Design", "طراحی واکنش‌گرا", "التصميم المتجاوب"],
      ["Accessibility (WCAG)", "دسترس‌پذیری (WCAG)", "إمكانية الوصول (WCAG)"],
      ["Data-informed Design", "طراحی مبتنی بر داده", "التصميم المستنير بالبيانات"],
    ],
  },
  {
    title: ["Leadership", "رهبری", "القيادة"],
    skills: [
      ["Stakeholder Management", "مدیریت ذی‌نفعان", "إدارة أصحاب المصلحة"],
      ["Cross-functional Collaboration", "همکاری بین‌تیمی", "التعاون بين الفرق"],
      ["Design Leadership", "رهبری طراحی", "قيادة التصميم"],
      ["Design Sprint Facilitation", "تسهیل اسپرینت طراحی", "تيسير سباقات التصميم"],
      ["Mentoring", "منتورینگ", "الإرشاد"],
    ],
  },
  {
    title: ["Tools", "ابزارها", "الأدوات"],
    skills: [
      "Figma",
      "Maze",
      "Miro",
      "Notion",
      "Jira",
      "ClickUp",
      "Webflow",
      "Zeplin",
      "Mockup Studio",
    ].map((v) => [v, v, v] as Text),
  },
];
export const services: { title: Text; description: Text }[] = [
  {
    title: ["Product Discovery & Strategy", "کشف و استراتژی محصول", "استكشاف المنتج واستراتيجيته"],
    description: [
      "Connect business goals, user needs, and a clear product direction.",
      "پیوند اهداف کسب‌وکار و نیازهای کاربر با مسیری روشن برای محصول.",
      "ربط أهداف الأعمال واحتياجات المستخدم باتجاه واضح للمنتج.",
    ],
  },
  {
    title: [
      "UX Research & Usability Testing",
      "پژوهش و تست کاربردپذیری",
      "بحوث تجربة المستخدم واختبارها",
    ],
    description: [
      "Turn observations and usability insights into informed design decisions.",
      "تبدیل مشاهدات و یافته‌های کاربردپذیری به تصمیمات آگاهانه طراحی.",
      "تحويل الملاحظات ورؤى قابلية الاستخدام إلى قرارات تصميم مدروسة.",
    ],
  },
  {
    title: ["End-to-End Product Design", "طراحی جامع محصول", "تصميم المنتجات المتكامل"],
    description: [
      "A coherent design process, from early discovery to high-fidelity delivery.",
      "فرایند طراحی یکپارچه، از کشف اولیه تا تحویل طرح نهایی.",
      "عملية تصميم متماسكة من الاستكشاف المبكر إلى التسليم عالي الدقة.",
    ],
  },
  {
    title: [
      "UX/UI for Web & Mobile",
      "طراحی UX/UI وب و موبایل",
      "تصميم تجربة وواجهات الويب والجوال",
    ],
    description: [
      "Intuitive, accessible interfaces that work across screen sizes.",
      "رابط‌های قابل‌فهم و دسترس‌پذیر در اندازه‌های مختلف نمایشگر.",
      "واجهات بديهية ومتاحة تعمل على مختلف أحجام الشاشات.",
    ],
  },
  {
    title: ["Design System Development", "توسعه دیزاین‌سیستم", "تطوير أنظمة التصميم"],
    description: [
      "Scalable foundations and reusable components for consistent products.",
      "زیرساخت مقیاس‌پذیر و اجزای بازاستفاده‌پذیر برای محصولاتی یکپارچه.",
      "أسس قابلة للتوسع ومكونات قابلة لإعادة الاستخدام لمنتجات متسقة.",
    ],
  },
  {
    title: [
      "Complex B2B Workflow Design",
      "طراحی گردش کار پیچیده B2B",
      "تصميم سير العمل المعقد للشركات",
    ],
    description: [
      "Bring clarity to complex processes with research and process mining.",
      "ایجاد شفافیت در فرایندهای پیچیده با پژوهش و فرایندکاوی.",
      "إضفاء الوضوح على العمليات المعقدة بالبحث وتنقيب العمليات.",
    ],
  },
  {
    title: [
      "Dashboards & Operational Interfaces",
      "داشبورد و رابط‌های عملیاتی",
      "لوحات المعلومات والواجهات التشغيلية",
    ],
    description: [
      "Help teams navigate information and carry out operational tasks.",
      "کمک به تیم‌ها برای درک اطلاعات و انجام وظایف عملیاتی.",
      "مساعدة الفرق على فهم المعلومات وتنفيذ المهام التشغيلية.",
    ],
  },
  {
    title: [
      "Prototyping & Developer Handoff",
      "نمونه‌سازی و تحویل به توسعه",
      "النمذجة والتسليم للمطورين",
    ],
    description: [
      "Make interactions tangible and give engineering a shared reference.",
      "ملموس‌کردن تعاملات و ایجاد مرجع مشترک برای تیم مهندسی.",
      "تجسيد التفاعلات وتوفير مرجع مشترك للفريق الهندسي.",
    ],
  },
];
export const certifications: { title: Text; issuer: Text; date: Text }[] = [
  {
    title: ["Google UI/UX Design", "طراحی UI/UX گوگل", "تصميم واجهات وتجربة المستخدم من Google"],
    issuer: ["Google", "گوگل", "Google"],
    date: ["May — Nov 2020", "مه — نوامبر ۲۰۲۰", "مايو — نوفمبر ٢٠٢٠"],
  },
  {
    title: ["User Research Course", "دوره تحقیقات کاربر", "دورة بحوث المستخدم"],
    issuer: ["Coursera", "کورسرا", "Coursera"],
    date: ["Dec 2020", "دسامبر ۲۰۲۰", "ديسمبر ٢٠٢٠"],
  },
  {
    title: ["UI/UX Design Specialist", "متخصص طراحی UI/UX", "متخصص تصميم الواجهات وتجربة المستخدم"],
    issuer: ["7Learn", "سون‌لرن", "7Learn"],
    date: ["Dec 2017 — Jun 2018", "دسامبر ۲۰۱۷ — ژوئن ۲۰۱۸", "ديسمبر ٢٠١٧ — يونيو ٢٠١٨"],
  },
  {
    title: ["Product Manager", "مدیریت محصول", "إدارة المنتجات"],
    issuer: ["University of Sharif", "دانشگاه شریف", "جامعة شريف"],
    date: ["Feb 2022 — Jul 2023", "فوریه ۲۰۲۲ — ژوئیه ۲۰۲۳", "فبراير ٢٠٢٢ — يوليو ٢٠٢٣"],
  },
];
