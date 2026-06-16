import HomePage from "@/components/HomePage";
import { JsonLd } from "@/components/JsonLd";
import {
  createFinancialServiceSchema,
  createOrganizationSchema,
  createWebSiteSchema,
  pageMetadata,
} from "@/lib/metadata";

export const metadata = pageMetadata.home;

export default function Home() {
  return (
    <>
      <JsonLd
        data={[
          createOrganizationSchema(),
          createWebSiteSchema(),
          createFinancialServiceSchema(),
        ]}
      />
      <HomePage />
    </>
  );
}
