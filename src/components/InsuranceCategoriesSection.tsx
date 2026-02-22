"use client";

import Image from "next/image";

interface CategoryCardProps {
    icon: string;
    title: string;
    description: string;
    iconBgColor: string;
}

const CategoryCard = ({
    icon,
    title,
    description,
    iconBgColor,
}: CategoryCardProps) => {
    return (
        <div className=" border border-[#94BCCA] rounded-lg p-6 hover:bg-slate-800/70 transition-colors duration-300">
            <div
                className={`w-16 h-16 ${iconBgColor} rounded-lg flex items-center justify-center mb-4`}
            >
                <img
                    src={icon}
                    alt={`${title} icon`}
                    width={34}
                    height={34}
                    className="w-[34px] h-[34px] object-fill"
                    style={{
                        width: "34px",
                        height: "34px",
                        minWidth: "34px",
                        minHeight: "34px",
                        maxWidth: "34px",
                        maxHeight: "34px",
                    }}
                />
            </div>
            <h3 className="text-white font-bold text-xl leading-none font-inter mb-3">
                {title}
            </h3>
            <p className="text-slate-300 font-bold text-[15px] leading-relaxed font-inter mb-6">
                {description}
            </p>
            <button className="bg-white border border-[#000000] text-[#22BBF9] px-4 py-2 rounded-md text-sm font-medium hover:bg-cyan-400 hover:text-slate-900 transition-colors duration-300">
                Learn More
            </button>
        </div>
    );
};

const InsuranceCategoriesSection = () => {
    const categories = [
        {
            icon: "/categoryicons/heart.png",
            title: "Health Insurance",
            description:
                "Protect yourself with blockchain-based health coverage that ensures transparent claims and instant payouts",
            iconBgColor: "bg-[#115D7C]",
        },
        {
            icon: "/categoryicons/car.png",
            title: "Vehicle Insurance",
            description:
                "Comprehensive coverage for your vehicles with automated claim processing powered by smart contracts.",
            iconBgColor: "bg-[#425533]",
        },
        {
            icon: "/categoryicons/house.png",
            title: "Property Insurance",
            description:
                "Secure your property with tamper-proof policies that provide reliable protection and fast settlements.",
            iconBgColor: "bg-[#555233]",
        },
        {
            icon: "/categoryicons/globe.png",
            title: "Travel Insurance",
            description:
                "Worry-free travel with instant coverage and automated payouts for delayed flights and other travel issues.",
            iconBgColor: "bg-[#3E117C]",
        },
        {
            icon: "/categoryicons/database.png",
            title: "Crypto-Asset Insurance",
            description:
                "Protect your digital assets, wallets, and NFTs against hacks, theft, and other crypto-specific risks.",
            iconBgColor: "bg-[#115D7C]",
        },
    ];

    return (
        <section className="py-20 px-4 bg-[#101935]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#080D24] mb-6">
                        Insurance Categories
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <p className="text-slate-300 font-bold text-xl leading-relaxed text-center font-inter">
                            We offer a wide range of insurance products to
                            protect what matters most to you, all powered by
                            blockchain technology.
                        </p>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, index) => (
                        <CategoryCard
                            key={index}
                            icon={category.icon}
                            title={category.title}
                            description={category.description}
                            iconBgColor={category.iconBgColor}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InsuranceCategoriesSection;
