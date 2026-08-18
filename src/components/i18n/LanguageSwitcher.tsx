"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { localeCookieName, locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const t = useTranslations("common.language");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onChange(nextLocale: Locale) {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.replace(pathname));
    router.refresh();
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-white/80">
      <span className="sr-only">{t("label")}</span>
      <select
        aria-label={t("label")}
        className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-white disabled:opacity-60"
        value={locale}
        disabled={isPending}
        onChange={(event) => onChange(event.target.value as Locale)}
      >
        {locales.map((item) => (
          <option key={item} value={item} className="bg-zinc-950 text-white">
            {t(`options.${item}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
