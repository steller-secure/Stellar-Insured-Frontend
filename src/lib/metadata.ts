import type { Metadata } from "next";
import { getEnv } from "@/config/env";
import type { Policy } from "@/types/policy";

/** Default site description used across pages. */
export const DEFAULT_DESCRIPTION =
  "Decentralized insurance platform built on Stellar. Buy transparent policies, file claims, and participate in DAO governance with blockchain-powered smart contracts.";

/** Shared keywords for insurance and blockchain SEO. */
export const DEFAULT_KEYWORDS = [
  "decentralized insurance",
  "Stellar blockchain",
  "crypto insurance",
  "smart contract insurance",
  "DAO governance",
  "insurance claims",
  "Web3 insurance",
];

/** Resolve and normalize the public site URL (no trailing slash). */
export function getSiteUrl(): string {
  const url = getEnv("NEXT_PUBLIC_SITE_URL");
  return url.replace(/\/$/, "");
}

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = ""): string {
  const base = getSiteUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const siteConfig = {
  get name(): string {
    return getEnv("NEXT_PUBLIC_APP_NAME");
  },
  description: DEFAULT_DESCRIPTION,
  locale: "en_US",
  twitterHandle: "@StellarInsured",
  get url(): string {
    return getSiteUrl();
  },
};

export interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
  keywords?: string[];
}

/** Create metadata for the root layout with title template and social defaults. */
export function createRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: DEFAULT_KEYWORDS,
    authors: [{ name: siteConfig.name, url: siteUrl }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteUrl,
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} – Decentralized Insurance on Stellar`,
        },
        {
          url: "/og/default.svg",
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} – Decentralized Insurance on Stellar`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      creator: siteConfig.twitterHandle,
      images: ["/twitter-image"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/** Create page-specific metadata with canonical URL and social tags. */
export function createPageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    path = "",
    noIndex = false,
    ogImage,
    keywords,
  } = options;

  const canonicalUrl = absoluteUrl(path);
  const imageUrl = ogImage ?? "/opengraph-image";

  return {
    title,
    description,
    keywords: keywords ?? DEFAULT_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonicalUrl,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: siteConfig.twitterHandle,
      images: [imageUrl],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

/** Pre-defined metadata for major application routes. */
export const pageMetadata = {
  home: createPageMetadata({
    title: "Decentralized Insurance on Stellar",
    description:
      "Protect your digital assets with transparent, blockchain-powered insurance. Browse policies, file claims, and govern the platform through DAO voting.",
    path: "/",
  }),
  about: createPageMetadata({
    title: "About Us",
    description:
      "Learn how Stellar Insured delivers tamper-proof, transparent, and automated insurance solutions powered by Stellar blockchain smart contracts.",
    path: "/about",
  }),
  policies: createPageMetadata({
    title: "My Policies",
    description:
      "View and manage your decentralized insurance policies. Track coverage, premiums, and policy status in one dashboard.",
    path: "/policies",
    noIndex: true,
  }),
  policyListing: createPageMetadata({
    title: "Browse Insurance Policies",
    description:
      "Explore decentralized insurance plans for crypto, property, travel, health, and more. Compare coverage and purchase on the Stellar blockchain.",
    path: "/policies/listing",
  }),
  claims: createPageMetadata({
    title: "Claims Dashboard",
    description:
      "Track and manage your insurance claims. Monitor claim status, upload documents, and receive settlements through smart contracts.",
    path: "/claims",
    noIndex: true,
  }),
  newClaim: createPageMetadata({
    title: "File a Claim",
    description:
      "Submit a new insurance claim with our guided multi-step process. Upload evidence and track your claim on the blockchain.",
    path: "/claims/new",
    noIndex: true,
  }),
  dao: createPageMetadata({
    title: "DAO Governance",
    description:
      "Participate in Stellar Insured governance. Review proposals, cast votes, and help shape the future of decentralized insurance.",
    path: "/dao/voting",
  }),
  dashboard: createPageMetadata({
    title: "Dashboard",
    description:
      "Your Stellar Insured dashboard. Monitor wallet balance, policies, claims, and platform activity at a glance.",
    path: "/dashboard",
    noIndex: true,
  }),
  signIn: createPageMetadata({
    title: "Sign In",
    description:
      "Sign in to Stellar Insured with your Stellar wallet to manage policies, file claims, and participate in governance.",
    path: "/signin",
    noIndex: true,
  }),
  signUp: createPageMetadata({
    title: "Sign Up",
    description:
      "Create your Stellar Insured account. Connect your Stellar wallet and start protecting your assets with decentralized insurance.",
    path: "/signup",
    noIndex: true,
  }),
} as const;

/** Build dynamic metadata for an individual policy detail page. */
export function createPolicyMetadata(policy: Policy): Metadata {
  const title = policy.name;
  const description =
    policy.description.length > 160
      ? `${policy.description.slice(0, 157)}...`
      : policy.description;

  return createPageMetadata({
    title,
    description,
    path: `/policies/${policy.id}`,
    keywords: [
      ...DEFAULT_KEYWORDS,
      policy.name,
      "insurance policy",
      policy.status,
    ],
  });
}

/** Fallback metadata when a policy cannot be loaded. */
export function createPolicyNotFoundMetadata(id: string): Metadata {
  return createPageMetadata({
    title: "Policy Not Found",
    description: "The requested insurance policy could not be found.",
    path: `/policies/${id}`,
    noIndex: true,
  });
}

// ─── Schema.org structured data ─────────────────────────────────────────────

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/og/default.svg"),
    description: siteConfig.description,
    sameAs: [],
  };
}

export function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };
}

export function createFinancialServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    serviceType: "Decentralized Insurance",
    areaServed: "Worldwide",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };
}

export function createInsuranceProductSchema(policy: Policy) {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: policy.name,
    description: policy.description,
    url: absoluteUrl(`/policies/${policy.id}`),
    category: "Insurance",
    offers: {
      "@type": "Offer",
      price: policy.premium,
      priceCurrency: "USD",
      availability:
        policy.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Coverage Amount",
        value: policy.coverage,
        unitText: "USD",
      },
      {
        "@type": "PropertyValue",
        name: "Policy ID",
        value: policy.policyId,
      },
      {
        "@type": "PropertyValue",
        name: "Status",
        value: policy.status,
      },
    ],
  };
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
