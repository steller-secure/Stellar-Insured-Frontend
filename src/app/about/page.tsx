import NavBar from "@/components/NavBar/NavBar";
import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen relative">
      <NavBar />
      <div className="pt-25 md:pt-45 pb-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto space-y-20 md:space-y-35">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 lg:gap-20">
          <div className="flex-1 space-y-2 md:space-y-6 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold leading-10">
              StellarInsured is a next generation decentralized{" "}
              <span className="text-[#22BBF9]">insurance platform</span>
            </h1>
            <p className="font-bold text-lg md:text-xl lg:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
              By leveraging blockchain technology, it offers tamper-proof,
              transparent, and automated insurance solutions without
              intermediaries. Smart contracts power policy issuance, claims
              processing, and settlements, ensuring fairness, efficiency, and
              fraud prevention.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/abt1.svg"
              alt="aboutimg"
              width={400}
              height={400}
              className="w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] h-auto"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 lg:gap-20">
          <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
            <p className="font-bold">
              <span className="text-[#22BBF9] text-3xl md:text-4xl lg:text-5xl block mb-2">
                StellarInsured
              </span>
              <span className="text-2xl md:text-3xl lg:text-3xl block mb-4">
                we uphold security, transparency
              </span>
              <span className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
                innovation, user-centricity, and compliance as core values. We
                prioritize robust security measures, ensure clear and verifiable
                processes, embrace cutting-edge blockchain advancements, and
                design intuitive experiences—all while adhering to the highest
                legal standards.
              </span>
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/abt2.svg"
              alt="aboutimg"
              width={400}
              height={400}
              className="w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

