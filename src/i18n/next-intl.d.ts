declare module "next-intl" {
  export function useLocale(): string;
  export function useTranslations(namespace?: string): (key: string, values?: Record<string, string | number>) => string;
  export function NextIntlClientProvider(props: {
    locale?: string;
    messages?: Record<string, unknown>;
    children: React.ReactNode;
  }): React.ReactElement;
}

declare module "next-intl/server" {
  export function getLocale(): Promise<string>;
  export function getMessages(): Promise<Record<string, unknown>>;
  export function getTranslations(namespace?: string): Promise<(key: string, values?: Record<string, string | number>) => string>;
  export function getRequestConfig<T>(fn: (...args: unknown[]) => T): T;
}

declare module "next-intl/plugin" {
  import type { NextConfig } from "next";
  export default function createNextIntlPlugin(path?: string): (config: NextConfig) => NextConfig;
}

declare module "next-intl/navigation" {
  export function createNavigation(config: unknown): {
    Link: typeof import("next/link").default;
    redirect: typeof import("next/navigation").redirect;
    usePathname: typeof import("next/navigation").usePathname;
    useRouter: typeof import("next/navigation").useRouter;
  };
}
