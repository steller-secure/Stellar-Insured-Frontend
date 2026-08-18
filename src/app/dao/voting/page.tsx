import DAOVotingClient from "@/components/dao/DAOVotingClient";
import { mockProposals } from "@/data/dao-mockData";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JsonLd } from "@/components/JsonLd";
import {
  createBreadcrumbSchema,
  pageMetadata,
} from "@/lib/metadata";

export const metadata = pageMetadata.dao;

/**
 * Server Component - fetches data and renders client component
 * In production, replace mockProposals with actual data fetching
 */
export default async function DAOVotingPage() {
  // TODO: Replace with actual data fetching from blockchain/API
  // const proposals = await fetchProposalsFromBlockchain();

  const proposals = mockProposals;

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
