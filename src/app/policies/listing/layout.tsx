import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.policyListing;

export default function PolicyListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
