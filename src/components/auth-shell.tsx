import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-stretch p-4 md:p-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_90px_rgba(0,0,0,0.65)] md:grid-cols-2">
          <div className="flex flex-col gap-8 p-8 md:p-10">
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-2xl font-semibold tracking-tight text-white">
                Stellar Insured
              </Link>
              <h1 className="text-3xl font-semibold text-white md:text-4xl">{title}</h1>
              <p className="max-w-md text-sm leading-relaxed text-white/70 md:text-base">
                {subtitle}
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-6">{children}</div>

            {footer ? (
              <div className="pt-2 text-center text-sm text-white/60">{footer}</div>
            ) : null}
          </div>

          <div className="relative hidden min-h-[520px] items-center justify-center bg-[#3c78d8] md:flex">
            <div className="relative h-full w-full">
              <Image
                src="/auth.jpg"
                alt="Auth"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-zinc-950/35" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
