import DAOVotingClient from "@/components/dao/DAOVotingClient";
import { DataService } from "@/config/dataSource";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JsonLd } from "@/components/JsonLd";
import {
  createBreadcrumbSchema,
  pageMetadata,
} from "@/lib/metadata";

export const metadata = pageMetadata.dao;

/**
 * Server Component - uses mock data in development and the API elsewhere.
 */
export default async function DAOVotingPage() {
  const proposals = await DataService.getProposals();

  return (
    /*
      id="main-content" is the skip-link target declared in layout.tsx.
      tabIndex={-1} lets the skip link programmatically focus this landmark
      without including it in the natural tab order.
      WCAG 2.4.1 – Bypass Blocks.
    */
    <main id="main-content" tabIndex={-1}>
      <ErrorBoundary>
        <JsonLd
          data={createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "DAO Governance", path: "/dao/voting" },
          ])}
        />
        <DAOVotingClient initialProposals={proposals} />
      </ErrorBoundary>
    </main>
  );
}
