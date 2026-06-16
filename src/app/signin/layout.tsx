import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.signIn;

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
