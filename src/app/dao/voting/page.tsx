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
    <ErrorBoundary>
      <JsonLd
        data={createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "DAO Governance", path: "/dao/voting" },
        ])}
      />
      <DAOVotingClient initialProposals={proposals} />
    </ErrorBoundary>
  );
}
