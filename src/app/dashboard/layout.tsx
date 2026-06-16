import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.dashboard;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
