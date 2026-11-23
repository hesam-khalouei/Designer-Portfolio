import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

const messages = {
  en: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please reload the page to try again.",
    action: "Reload page",
  },
  fa: {
    title: "مشکلی پیش آمده است",
    description: "خطای پیش‌بینی‌نشده‌ای رخ داده است. لطفاً صفحه را دوباره بارگذاری کنید.",
    action: "بارگذاری مجدد صفحه",
  },
  ar: {
    title: "حدث خطأ ما",
    description: "حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.",
    action: "إعادة تحميل الصفحة",
  },
};

export default class RootErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught application error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const root = document.documentElement;
    const language = root.lang.toLowerCase().split("-")[0];
    const copy = messages[language as keyof typeof messages] ?? messages.en;

    return (
      <main className="root-error" dir={root.dir || "ltr"}>
        <section className="root-error-content" role="alert" aria-labelledby="root-error-title">
          <p className="eyebrow">Portfolio</p>
          <h1 id="root-error-title">{copy.title}</h1>
          <p>{copy.description}</p>
          <button type="button" onClick={() => window.location.reload()}>
            {copy.action}
          </button>
        </section>
      </main>
    );
  }
}
