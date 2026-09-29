import { getRequestConfig } from "next-intl/server"
import { loadMessages, resolveUiLanguage } from "@/lib/translations"

// Server-side next-intl config (used by server components / getTranslations).
// Shares the locale list and cached loader with the client in lib/translations.
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = resolveUiLanguage(await requestLocale) ?? "en"
  return { locale, messages: await loadMessages(locale) }
})
