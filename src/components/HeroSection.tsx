import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="z-10 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl font-bold leading-tight text-fg sm:text-4xl lg:text-5xl xl:text-6xl">
              Decentralized Insurance for the{" "}
              <span className="text-primary">StellarNet</span> Ecosystem
            </h1>

            <p className="text-base text-fg-muted sm:text-lg lg:text-xl lg:max-w-xl mx-auto lg:mx-0">
              Secure your digital assets with transparent, automated, and
              tamper-proof insurance policies powered by blockchain technology.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-center lg:justify-start">
              <Button size="lg">Get Started</Button>
              <Button variant="outline" color="neutral" size="lg">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative h-[340px] w-[340px] md:h-[450px] md:w-[450px] lg:h-[550px] lg:w-[550px]">
              {/* Outer image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/images/hero/outer.png"
                  alt="Stellar coins"
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
                  alt="Stellar coin detail"
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
