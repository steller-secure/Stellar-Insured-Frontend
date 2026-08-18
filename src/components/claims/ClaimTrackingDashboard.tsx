'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { type Claim } from '@/data/mockData';
import { useDataFetchList } from '@/hooks/useDataFetch';
import { DataService } from '@/config/dataSource';
import { ClaimsSkeleton, EmptyState, ErrorState } from '@/components/ui/SkeletonLoaders';

export interface ClaimTrackingDashboardProps {
  showSearch?: boolean;
  maxClaims?: number;
}

const statusColors = {
  'Active': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Pending': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Approved': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Rejected': 'bg-red-500/20 text-red-400 border-red-500/30'
};

/**
 * Returns the status icon SVG.
 * All icons are aria-hidden — the status text already conveys meaning.
 * WCAG 1.1.1 – Non-text Content: decorative images/icons must be hidden from AT.
 */
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Active':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case 'Pending':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    case 'Approved':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    case 'Rejected':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
};

interface ProgressStep {
  id: number;
  title: string;
  completed: boolean;
  current?: boolean;
}

const getProgressSteps = (status: string): ProgressStep[] => {
  const allSteps: ProgressStep[] = [
    { id: 1, title: 'Submitted', completed: true },
    { id: 2, title: 'Under Review', completed: false },
    { id: 3, title: 'Investigation', completed: false },
    { id: 4, title: 'Decision', completed: false },
    { id: 5, title: 'Completed', completed: false }
  ];

  switch (status) {
    case 'Pending':
      return allSteps.map((step, index) => ({
        ...step,
        completed: index === 0,
        current: index === 1
      }));
    case 'Active':
      return allSteps.map((step, index) => ({
        ...step,
        completed: index <= 1,
        current: index === 2
      }));
    case 'Approved':
    case 'Rejected':
      return allSteps.map((step, index) => ({
        ...step,
        completed: index <= 4,
        current: false
      }));
    default:
      return allSteps;
  }
};

export const ClaimTrackingDashboard: React.FC<ClaimTrackingDashboardProps> = ({
  showSearch = true,
  maxClaims
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  // Fetch claims with loading state
  const { items: claims, loading, error, refetch } = useDataFetchList(
    () => DataService.getClaims(),
    {
      cacheDuration: 5 * 60 * 1000,
      eventTypes: ['claim.submitted', 'claim.updated'],
    }
  );

  const filteredClaims = claims
    .filter(claim => 
      claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.incidentType.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, maxClaims);

  /**
   * ClaimProgressTracker
   *
   * WCAG 1.3.1 – Info and Relationships: steps are rendered as a list.
   * WCAG 4.1.2 – Name, Role, Value: each step communicates its state
   * (completed / current / upcoming) via aria-label.
   * WCAG 1.4.3 – Contrast: "In Progress" label uses cyan-400 on slate-900.
   */
  const ClaimProgressTracker = ({ claim }: { claim: Claim }) => {
    const steps = getProgressSteps(claim.status);
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white" id={`progress-tracker-${claim.id}`}>
          Processing Progress
        </h4>
        {/* ol conveys ordered, sequential relationship between steps */}
        <ol
          className="space-y-3 list-none m-0 p-0"
          aria-labelledby={`progress-tracker-${claim.id}`}
        >
          {steps.map((step, index) => {
            const stepState = step.completed
              ? 'completed'
              : step.current
              ? 'current'
              : 'upcoming';
            const stepLabel = `Step ${step.id}: ${step.title} — ${
              stepState === 'completed'
                ? 'completed'
                : stepState === 'current'
                ? 'in progress'
                : 'not yet reached'
            }`;

            return (
              <li
                key={step.id}
                className="flex items-center space-x-3"
                aria-label={stepLabel}
              >
                {/*
                  The step indicator circle is decorative (the li aria-label
                  communicates the state), so it's hidden from AT.
                */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : step.current
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-400'
                  }`}
                  aria-hidden="true"
                >
                  {step.completed ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs font-medium" aria-hidden="true">{step.id}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    step.completed || step.current ? 'text-white' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </p>
                  {step.current && (
                    <p className="text-xs text-cyan-400" aria-hidden="true">In Progress</p>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-4 mt-8 w-0.5 h-6 ${
                      step.completed ? 'bg-green-500' : 'bg-slate-600'
                    }`}
                    style={{ marginLeft: '15px' }}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white" id="claim-tracking-heading">
            Claim Tracking
          </h2>
          <p className="text-slate-400">Monitor the status of your insurance claims</p>
        </div>
        {showSearch && (
          /*
            WCAG 1.3.1 / 2.4.6 – Labels or Instructions:
            Input requires an associated label; providing an empty label string
            hides the visual label but the Input component still associates
            htmlFor with the input id. We give the input a meaningful id so it
            can be discovered by assistive technology.
          */
          <div className="w-64">
            <Input
              id="claim-search"
              label="Search claims"
              placeholder="Search claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search claims by ID, policy name, or incident type"
            />
          </div>
        )}
      </div>

      {/* Claims List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white" id="claims-list-heading">
            Your Claims
          </h3>
          {loading ? (
            <ClaimsSkeleton />
          ) : error ? (
            <ErrorState 
              title="Failed to load claims"
              description={error.message}
              onRetry={refetch}
            />
          ) : filteredClaims.length === 0 ? (
            <EmptyState 
              title="No claims found"
              description={searchTerm ? "Try adjusting your search terms" : "You don't have any claims yet"}
            />
          ) : (
            /*
              WCAG 2.1.1 – Keyboard: List items are rendered as <button> elements
              so they can be focused and activated with Enter/Space.
              role="list" on the wrapping ul explicitly restores list semantics
              for AT that strip them when list-style is removed via CSS.
            */
            <ul
              className="space-y-3 list-none m-0 p-0"
              role="list"
              aria-labelledby="claims-list-heading"
            >
              {filteredClaims.map((claim) => {
                const isSelected = selectedClaim?.id === claim.id;
                return (
                  <li key={claim.id} role="listitem">
                    <button
                      type="button"
                      onClick={() => setSelectedClaim(claim)}
                      aria-pressed={isSelected}
                      aria-label={`View details for claim ${claim.id}, ${claim.policyName}, status: ${claim.status}, amount: ${claim.amountFormatted}`}
                      className={`w-full text-left p-4 rounded-xl cursor-pointer transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1F] ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/30' 
                          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-white">{claim.id}</p>
                            <p className="text-sm text-slate-400">{claim.policyName}</p>
                          </div>
                          <Badge className={statusColors[claim.status as keyof typeof statusColors]}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(claim.status)}
                              <span>{claim.status}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">
                            Amount: <span className="text-white font-medium">{claim.amountFormatted}</span>
                          </span>
                          <span className="text-slate-400">Filed: {claim.dateFiled}</span>
                        </div>
                        
                        <div className="text-xs text-slate-500">
                          {claim.incidentType}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Claim Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white" id="claim-details-heading">
            Claim Details
          </h3>

          {/*
            aria-live="polite" announces claim detail changes to screen-reader
            users when a different claim is selected.
            WCAG 4.1.3 – Status Messages
          */}
          <div aria-live="polite" aria-atomic="true" aria-labelledby="claim-details-heading">
            {selectedClaim ? (
              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <div className="space-y-6">
                  {/* Claim Header */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl font-semibold text-white">{selectedClaim.id}</h4>
                      <Badge className={statusColors[selectedClaim.status as keyof typeof statusColors]}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(selectedClaim.status)}
                          <span>{selectedClaim.status}</span>
                        </div>
                      </Badge>
                    </div>
                    <p className="text-slate-400">{selectedClaim.policyName}</p>
                  </div>

                  {/* Claim Info */}
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-slate-400">Claim Amount</dt>
                      <dd className="text-white font-semibold text-lg">{selectedClaim.amountFormatted}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Date Filed</dt>
                      <dd className="text-white">{selectedClaim.dateFiled}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-400">Incident Type</dt>
                      <dd className="text-white">{selectedClaim.incidentType}</dd>
                    </div>
                  </dl>

                  {/* Description */}
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Description</p>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <p className="text-white text-sm">{selectedClaim.description}</p>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  <ClaimProgressTracker claim={selectedClaim} />

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t border-slate-600">
                    <Button variant="outline" size="sm">
                      Download Documents
                    </Button>
                    <Button variant="outline" size="sm">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center bg-slate-800/50 border-slate-700">
                <div className="space-y-2">
                  <svg
                    className="mx-auto h-12 w-12 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <p className="text-slate-400">Select a claim to view details</p>
                  <p className="text-sm text-slate-500">Click on any claim from the list to see its progress and details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
