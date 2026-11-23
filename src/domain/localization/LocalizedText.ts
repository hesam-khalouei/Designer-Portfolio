export type Lang = "en" | "fa" | "ar";
export type Text = [string, string, string];

export const text = (value: Text, lang: Lang): string =>
  value[lang === "en" ? 0 : lang === "fa" ? 1 : 2];
