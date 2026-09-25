import { getRequestConfig } from "next-intl/server";

export const SUPPORTED_LOCALES = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ru",
  "ja",
  "ko",
  "zh",
  "hi",
  "ar",
  "bn",
  "id",
  "nl",
  "tr",
  "pl",
  "vi",
  "th",
  "sv",
  "da",
  "nb",
  "fi",
  "el",
  "cs",
  "uk",
  "ro",
  "hu",
  "he",
  "ms",
  "fil",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    locale = "en";
  }

  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
