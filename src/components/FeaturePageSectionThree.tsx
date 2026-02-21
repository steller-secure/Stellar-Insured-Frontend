"use client";

import Image from "next/image";

const highlights = [
  {
    title: "Decentralized Risk Pools",
    description:
      "Users collectively fund insurance pools, spreading risk across the network. Payouts and pool management are governed transparently by the community.",
  },
  {
    title: "Full Transparency & Fraud Resistance",
    description:
      "Every policy, claim, and payout is recorded on the Stellar blockchain, creating an immutable audit trail that prevents fraud and increases trust.",
  },
  {
    title: "Multi-Asset & Multi-Use Coverage",
    description:
      "Protect a wide range of assets—from health and travel to property and crypto—using a single decentralized insurance platform.",
  },
  {
    title: "DAO Governance",
    description:
      "Policyholders actively shape the platform by creating proposals and voting on key decisions through a decentralized autonomous organization (DAO).",
  },
];

const FeaturePageSectionThree = () => {
  return (
    <section
      id="features"
      className="relative bg-[#141A33] pb-20 pt-32 sm:pt-36 lg:pt-[197px]"
      aria-labelledby="feature-section-three-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,187,249,0.08),_transparent_60%)]" />
      <div className="relative mx-auto flex w-full max-w-[1242px] flex-col gap-14 px-5 sm:px-8 lg:px-0">
        <h2 id="feature-section-three-title" className="sr-only">
          Feature Highlights
        </h2>

        <div className="flex flex-col items-center gap-10 text-center lg:grid lg:text-left lg:items-start lg:grid-cols-[660px_440px] lg:gap-[110px]">
          <div className="space-y-3 text-white motion-safe:animate-slide-up lg:mt-[25px]">
            <h3 className="w-[660px] max-w-full min-h-[58px] text-[48px] font-bold leading-none max-lg:w-full max-lg:min-h-0 max-lg:text-[34px] max-lg:leading-[1.1] max-sm:text-[30px]">
              Smart Contract <span className="text-[#22BBF9]">Insurance</span>
            </h3>
            <p className="w-[564px] max-w-full min-h-[93px] text-[20px] font-bold leading-none text-[#E0D7D7] max-lg:w-full max-lg:min-h-0 max-lg:text-[16px] max-lg:leading-[1.4]">
              Insurance policies are created, enforced, and managed by
              self-executing Soroban smart contracts, ensuring rules are
              transparent and applied fairly to everyone.
            </p>
          </div>

          <div className="motion-safe:animate-fade-in">
            <div
              className="relative w-full max-w-[440px] overflow-hidden rounded-[62px] bg-[#0B0F1F] lg:ml-auto lg:h-[433px] lg:w-[440px] max-lg:mx-auto max-lg:h-auto max-lg:w-[320px] max-lg:rounded-[40px] max-sm:w-[280px]"
              style={{
                aspectRatio: "440 / 433",
                boxShadow: "0px 4px 4px 0px #3B837A",
              }}
            >
              <Image
                src="/images/features/feature-cube.jpg"
                alt="Abstract cube representing smart contract insurance"
                fill
                className="object-cover opacity-90"
                sizes="(max-width: 640px) 80vw, 440px"
                priority
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-10 text-center lg:grid lg:text-left lg:items-start lg:grid-cols-[409px_709px] lg:gap-[124px]">
          <div className="motion-safe:animate-fade-in max-lg:order-2">
            <div
              className="relative w-full max-w-[409px] overflow-hidden rounded-[46px] bg-[#0B0F1F] lg:mr-auto lg:h-[409px] lg:w-[409px] max-lg:mx-auto max-lg:h-auto max-lg:w-[300px] max-lg:rounded-[34px] max-sm:w-[260px]"
              style={{
                aspectRatio: "409 / 409",
                boxShadow: "0px 4px 4px 0px #E0C31A",
              }}
            >
              <Image
                src="/images/features/feature-claims.jpg"
                alt="On-chain claims processing interface"
                fill
                className="object-cover opacity-85"
                sizes="(max-width: 640px) 80vw, 409px"
              />
            </div>
          </div>

          <div className="space-y-3 text-white motion-safe:animate-slide-up lg:mt-[93px] max-lg:order-1">
            <h3 className="w-[709px] max-w-full min-h-[58px] text-[48px] font-bold leading-none max-lg:w-full max-lg:min-h-0 max-lg:text-[34px] max-lg:leading-[1.1] max-sm:text-[30px]">
              Automated <span className="text-[#22BBF9]">Claims</span> Processing
            </h3>
            <p className="w-[625px] max-w-full min-h-[57px] text-[16px] font-bold leading-none text-white max-lg:w-full max-lg:min-h-0 max-lg:text-[15px] max-lg:leading-[1.5]">
              Submit claims directly on-chain and track their status in real
              time. Claims are validated automatically based on predefined
              conditions, reducing delays and manual bias.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {highlights.map((item) => {
            const words = item.title.split(" ");
            const highlightWords = new Set([
              "Risk",
              "Transparency",
              "Multi-Asset",
              "DAO",
            ]);

            return (
              <article
                key={item.title}
                className="group relative w-full overflow-hidden rounded-[20px] border border-[#413F54] px-[17.5px] pb-6 pt-[50px] transition-transform duration-300 hover:-translate-y-1"
                style={{
                  background:
                    "linear-gradient(174.3deg, rgba(87, 48, 203, 0.2) 23.59%, rgba(30, 36, 51, 0.2) 47.4%, rgba(210, 197, 59, 0.2) 91.52%)",
                  boxShadow: "0px 4px 4px 0px #B6FA9E",
                  minHeight: "241px",
                  maxWidth: "625.5px",
                }}
              >
                <div className="relative">
                  <h4 className="w-[608px] max-w-full min-h-[88px] text-[36px] font-bold leading-none text-white max-sm:w-full max-sm:min-h-0 max-sm:text-[24px] max-sm:leading-[1.2]">
                    {words.map((word, index) => {
                      const isHighlighted = highlightWords.has(word);
                      return (
                        <span
                          key={`${word}-${index}`}
                          className={isHighlighted ? "text-[#22BBF9]" : undefined}
                        >
                          {word}
                          {index < words.length - 1 ? " " : ""}
                        </span>
                      );
                    })}
                  </h4>
                  <p className="mt-[17px] w-[492px] max-w-full min-h-[57px] text-[16px] font-bold leading-none text-white max-sm:w-full max-sm:min-h-0 max-sm:text-[14px] max-sm:leading-[1.4]">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturePageSectionThree;
