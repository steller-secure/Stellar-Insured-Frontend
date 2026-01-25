import Navbar from '@/components/NavBar'
import Image from 'next/image'
import walletImg from "@/assests/3D Illustration - Wallet 1.svg"; 
import safeImg from "@/assests/ChatGPT Image Jun 25, 2025, 02_39_28 PM 1.svg";

const page = () => {
  return (
    <div>
      <div className="min-h-screen bg-[#1A1F35] text-white overflow-x-hidden selection:bg-[#00B4D8] selection:text-[#0B1221]">
      {/* Navbar */}
      <Navbar />

      {/* Section Content Container */}
      <section className="w-[89%] mx-auto px-6 pt-32 pb-20 md:pt-40">
        
        {/* --- SECTION 1: Hero (Text + Wallet) --- */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-0 mb-32">
          
          {/* Left: section Text */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-[48px] font-bold leading-[1.15]">
              Stellar<span className="text-white">Insured</span> is a 
              next-generation decentralized 
              <span className="text-[#00B4D8]"> insurance platform</span>
            </h1>
            
            <p className="text-[#E0D7D7] font-bold md:text-[21px] text-[16px] leading-relaxed max-w-2xl mx-auto lg:mx-0">
             By leveraging blockchain technology, it offers tamper-proof, transparent, and automated insurance solutions without intermediaries. Smart contracts power policy issuance, claims processing, and settlements, ensuring fairness, efficiency, and fraud prevention. 
            </p>
          </div>

          {/* Right: Wallet Image */}
          <div className="flex-1 relative flex justify-center lg:justify-end">
            {/* Purple Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-purple-600/30 rounded-full blur-[80px]" />
            
            {/* Image with Float Animation */}
            <div className="relative w-[300px] md:w-[450px] animate-float">
              <Image 
                src={walletImg} 
                alt="Decentralized Wallet" 
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24">

          {/* Left: Safe Image */}
          <div className="flex-1 relative flex justify-center lg:justify-start">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-[#00B4D8]/20 rounded-full blur-[80px]" />
             
             {/* Image with Delayed Float Animation */}
             <div className="relative w-[280px] md:w-[400px] animate-float-delayed">
              <Image 
                src={safeImg} 
                alt="Secure Safe" 
                className="object-contain drop-shadow-2xl lazy-loading"
              />
            </div>
          </div>
        </div>
      </section>
    </div>      
    </div>
  )
}

export default page
