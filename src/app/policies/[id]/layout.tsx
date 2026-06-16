import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { DataService } from "@/config/dataSource";
import {
  createBreadcrumbSchema,
  createInsuranceProductSchema,
  createPolicyMetadata,
  createPolicyNotFoundMetadata,
} from "@/lib/metadata";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const policy = await DataService.getPolicy(id);
    if (policy) {
      return createPolicyMetadata(policy);
    }
  } catch {
    // Fall through to not-found metadata
  }

  return createPolicyNotFoundMetadata(id);
}

export default async function PolicyDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params;
  const policy = await DataService.getPolicy(id).catch(() => undefined);

  return (
    <>
      {policy && (
        <JsonLd
          data={[
            createInsuranceProductSchema(policy),
            createBreadcrumbSchema([
              { name: "Policies", path: "/policies" },
              { name: policy.name, path: `/policies/${policy.id}` },
            ]),
          ]}
        />
      )}
      {children}
    </>
  );
}
