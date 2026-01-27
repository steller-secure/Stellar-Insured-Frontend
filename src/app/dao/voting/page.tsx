import DAOVotingClient from "@/components/dao/DAOVotingClient";
import { mockProposals } from "@/data/dao-mockData";
import type { Metadata } from "next";

/**
 * Page metadata for SEO
 */
export const metadata: Metadata = {
  title: "DAO Governance | StellarInsured",
  description: "Participate in governance decisions and vote on proposals",
};

/**
 * Server Component - fetches data and renders client component
 * In production, replace mockProposals with actual data fetching
 */
export default async function DAOVotingPage() {
  // TODO: Replace with actual data fetching from blockchain/API
  // const proposals = await fetchProposalsFromBlockchain();

  const proposals = mockProposals;

  return <DAOVotingClient initialProposals={proposals} />;
}
