/**
 * Tests for centralized SEO metadata utilities.
 */

describe("metadata", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("NEXT_PUBLIC_")) {
        delete process.env[key];
      }
    });
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  function loadMetadata() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@/lib/metadata") as typeof import("@/lib/metadata");
  }

  describe("getSiteUrl", () => {
    it("returns default site URL without trailing slash", () => {
      const { getSiteUrl } = loadMetadata();
      expect(getSiteUrl()).toBe("https://stellar-insured.com");
    });

    it("strips trailing slash from configured URL", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com/";
      const { getSiteUrl } = loadMetadata();
      expect(getSiteUrl()).toBe("https://app.example.com");
    });
  });

  describe("absoluteUrl", () => {
    it("builds absolute URLs from relative paths", () => {
      const { absoluteUrl } = loadMetadata();
      expect(absoluteUrl("/about")).toBe("https://stellar-insured.com/about");
    });
  });

  describe("createRootMetadata", () => {
    it("includes title template and Open Graph defaults", () => {
      const { createRootMetadata } = loadMetadata();
      const metadata = createRootMetadata();

      expect(metadata.title).toEqual({
        default: "Stellar Insured",
        template: "%s | Stellar Insured",
      });
      expect(metadata.openGraph?.siteName).toBe("Stellar Insured");
      expect(metadata.twitter?.card).toBe("summary_large_image");
      expect(metadata.alternates?.canonical).toBe("https://stellar-insured.com");
    });
  });

  describe("createPageMetadata", () => {
    it("sets canonical URL and page-specific social tags", () => {
      const { createPageMetadata } = loadMetadata();
      const metadata = createPageMetadata({
        title: "About Us",
        description: "About page description",
        path: "/about",
      });

      expect(metadata.title).toBe("About Us");
      expect(metadata.description).toBe("About page description");
      expect(metadata.alternates?.canonical).toBe(
        "https://stellar-insured.com/about"
      );
      expect(metadata.openGraph?.url).toBe("https://stellar-insured.com/about");
    });

    it("supports noIndex for authenticated pages", () => {
      const { createPageMetadata } = loadMetadata();
      const metadata = createPageMetadata({
        title: "Dashboard",
        description: "Private dashboard",
        path: "/dashboard",
        noIndex: true,
      });

      expect(metadata.robots).toEqual({ index: false, follow: false });
    });
  });

  describe("createPolicyMetadata", () => {
    it("uses policy name and description for dynamic pages", () => {
      const { createPolicyMetadata } = loadMetadata();
      const metadata = createPolicyMetadata({
        id: "1",
        name: "Crypto Asset Protection",
        status: "active",
        coverage: 75000,
        premium: 120,
        expiryDate: "Apr 15, 2026",
        policyId: "POL-2025-001",
        description: "Comprehensive coverage for digital assets.",
        terms: [],
      });

      expect(metadata.title).toBe("Crypto Asset Protection");
      expect(metadata.alternates?.canonical).toBe(
        "https://stellar-insured.com/policies/1"
      );
    });
  });

  describe("structured data", () => {
    it("creates organization schema with site URL", () => {
      const { createOrganizationSchema } = loadMetadata();
      const schema = createOrganizationSchema();

      expect(schema["@type"]).toBe("Organization");
      expect(schema.url).toBe("https://stellar-insured.com");
    });

    it("creates insurance product schema from policy data", () => {
      const { createInsuranceProductSchema } = loadMetadata();
      const schema = createInsuranceProductSchema({
        id: "1",
        name: "Crypto Asset Protection",
        status: "active",
        coverage: 75000,
        premium: 120,
        expiryDate: "Apr 15, 2026",
        policyId: "POL-2025-001",
        description: "Comprehensive coverage for digital assets.",
        terms: [],
      });

      expect(schema["@type"]).toBe("FinancialProduct");
      expect(schema.name).toBe("Crypto Asset Protection");
      expect(schema.offers.price).toBe(120);
    });
  });
});
