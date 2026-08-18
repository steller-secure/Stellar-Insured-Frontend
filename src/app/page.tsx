import HomePage from "@/components/HomePage";
import { JsonLd } from "@/components/JsonLd";
import {
  createFinancialServiceSchema,
  createOrganizationSchema,
  createWebSiteSchema,
} from "@/lib/metadata";
import { createPageMetadata } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("metadata");
  return createPageMetadata({
    title: t("homeTitle"),
    description: t("homeDescription"),
    path: "/",
  });
}

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
