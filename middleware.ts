import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, localeCookieName } from "@/i18n/config";

function resolveLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const headerLocale = request.headers
    .get("accept-language")
    ?.split(",")
    .map((part) => part.trim().split(";")[0]?.split("-")[0])
    .find(isLocale);

  return headerLocale ?? defaultLocale;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const locale = resolveLocale(request);
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  response.headers.set("x-stellar-insured-locale", locale);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
