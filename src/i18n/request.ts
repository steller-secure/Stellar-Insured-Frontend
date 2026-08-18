import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "./config";

function pickLocale(acceptLanguage: string | null): Locale {
  const preferred = acceptLanguage
    ?.split(",")
    .map((part) => part.trim().split(";")[0]?.split("-")[0])
    .find(isLocale);

  return preferred ?? defaultLocale;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : pickLocale(headerStore.get("accept-language"));

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const fallbackMessages =
    locale === defaultLocale
      ? {}
      : (await import(`../../messages/${defaultLocale}.json`)).default;

  return {
    locale,
    messages: {...fallbackMessages, ...messages},
    onError(error: { code?: string }) {
      if (error.code === "MISSING_MESSAGE") return;
      console.error(error);
    },
    getMessageFallback({namespace, key}: {namespace?: string; key: string}) {
      return [namespace, key].filter(Boolean).join(".");
    },
  };
});
