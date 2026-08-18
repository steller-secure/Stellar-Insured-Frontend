import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.dashboard;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
      id="main-content" is the skip-link target declared in layout.tsx.
      tabIndex={-1} lets the skip link move focus here programmatically
      without inserting it into the natural tab order.
      WCAG 2.4.1 – Bypass Blocks.
    */
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
  );
}
