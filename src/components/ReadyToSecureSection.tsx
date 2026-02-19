"use client";

import Link from "next/link";

export default function ReadyToSecureSection() {
  return (
    <section 
      className="relative bg-[#1A1F35] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-5xl text-center">
        {/* Main Heading */}
        <h2 
          id="cta-heading"
          className="font-bold text-[#080D24] mb-8 text-center font-inter"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(32px, 6vw, 48px)',
            lineHeight: '100%',
            letterSpacing: '0%'
          }}
        >
          Ready to Secure Your Digital Assets?
        </h2>

        {/* Subheading */}
        <p 
          className="text-white mb-12 lg:mb-16 text-center font-inter font-bold max-w-4xl mx-auto"
          style={{
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '100%',
            letterSpacing: '0%'
          }}
        >
          Join thousands of users who trust Stellar Insured for transparent and reliable blockchain-based 
          insurance coverage.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 sm:justify-center items-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-[#22BBF9] p-3 text-lg font-semibold text-[#0A0E27] transition-all duration-200 hover:bg-[#00BFEA] hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#00D4FF]/50 shadow-lg hover:shadow-xl w-fit"
            role="button"
            aria-label="Get started with Stellar Insured - Sign up for an account"
          >
            Get Started
          </Link>
          
          <Link
            href="/policies"
            className="inline-flex items-center justify-center rounded-lg border-2 border-white bg-[#FFFFFF] p-2 text-lg font-semibold text-[#22BBF9] transition-all duration-200 hover:bg-white hover:text-[#0A0E27] hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50 shadow-lg hover:shadow-xl w-fit"
            role="button"
            aria-label="Schedule a demo - Learn more about our services"
          >
            Schedule a Demo
          </Link>
        </div>
      </div>

     
    </section>
  );
}