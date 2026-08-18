import Image from "next/image";
import { useTranslations } from "next-intl";

export default function HeroSection() {
  const tHome = useTranslations("home");
  const tActions = useTranslations("common.actions");

  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="z-10 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl font-bold leading-tight text-text-primary dark:text-white sm:text-4xl lg:text-5xl xl:text-6xl">
              {tHome("heroTitle")}
            </h1>

            <p className="text-base text-text-secondary dark:text-gray-300 sm:text-lg lg:text-xl lg:max-w-xl mx-auto lg:mx-0">
              {tHome("heroSubtitle")}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-center lg:justify-start">
              <button className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-brand-hover sm:px-8 sm:py-3.5 sm:text-base">
                {tActions("getStarted")}
              </button>
              <button className="rounded-lg border-2 border-slate-800 dark:border-white bg-white dark:bg-transparent px-6 py-3 text-sm font-semibold text-slate-800 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800 sm:px-8 sm:py-3.5 sm:text-base">
                {tActions("learnMore")}
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative h-[340px] w-[340px] md:h-[450px] md:w-[450px] lg:h-[550px] lg:w-[550px]">
              {/* Outer image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/images/hero/outer.png"
                  alt={tHome("heroTitle")}
                  width={500}
                  height={500}
                  className="h-auto w-full object-contain opacity-60"
                  priority
                />
              </div>

              {/* Inner image (tilted, smaller, overlayed) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45">
                <Image
                  src="/images/hero/inner.jpg"
                  alt={tHome("heroSubtitle")}
                  width={350}
                  height={350}
                  className="h-auto w-[50px] object-contain lg:w-[100px]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
