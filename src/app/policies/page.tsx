import MyPoliciesPage from "@/components/policies/MyPoliciesPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.policies;

export default function PoliciesPage() {
  return <MyPoliciesPage />;
}
