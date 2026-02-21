import Image from "next/image";
import BlackGold from "../../assests/BlackGold.svg";
import BitcoinScan from "../../assests/BitcoinScan.svg";

function sectionOne() {
    return (
        <section className="bg-[#1A1F35] grid justify-center py-10">
            <div className="p-4 max-w-[1279] grid gap-y-20 justify-center">
                <div className="md:flex md:grid-cols-2 md:gap-10 md:items-center lg:gap-40">
                    <article className="mb-10 flex-2">
                        <h3 className="text-left font-bold text-2xl mb-5 md:text-3xl lg:text-5xl">
                            Smart Contract{" "}
                            <span className="text-[#00D4FF]">Insurance</span>
                        </h3>

                        <p className="font-bold text-base md:text-xl">
                            Insurance policies are created, enforced, and
                            managed by self-executing Soroban smart contracts,
                            ensuring rules are transparent and applied fairly to
                            everyone.
                        </p>
                    </article>
                    <div className="flex-1 relative rounded-[62] max-w-[430] overflow-hidden shadow-[0_4px_4px_0_#3b837a]">
                        <Image
                            src={BlackGold}
                            alt="Black Gold"
                            height={440}
                            width={430}
                        />
                    </div>
                </div>
                <div className="md:flex md:flex-row-reverse md:items-center md:gap-10  lg:gap-40">
                    <article className="mb-10 flex-2">
                        <h3 className="text-left font-bold text-2xl mb-5 md:text-3xl lg:text-5xl">
                            Automated{" "}
                            <span className="text-[#00D4FF]">Claims</span>{" "}
                            Processing
                        </h3>

                        <p className="font-bold text-base md:text-xl">
                            Submit claims directly on-chain and track their
                            status in real time. Claims are evaluated
                            automatically based on predefined conditions,
                            reducing delays and manual bias
                        </p>
                    </article>
                    <div className="flex-1 rounded-[62] max-w-[430] overflow-hidden shadow-[0_4px_4px_0_#e0c31a] md:order-1">
                        <Image
                            src={BitcoinScan}
                            alt="Black Gold"
                            height={440}
                            width={430}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default sectionOne;
