import ClaimsShell from "@/components/claims/ClaimsShell";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.claims;

export default function ClaimsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClaimsShell>{children}</ClaimsShell>;
}
