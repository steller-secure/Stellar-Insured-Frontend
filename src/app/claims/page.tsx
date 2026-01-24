'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mockClaims } from '@/data/mockData';

const statusColors = {
    Active: 'bg-green-500/20 text-green-400 border-green-500/20',
    Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    Approved: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
    Rejected: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
};

export default function ClaimsPage() {
    const [filter, setFilter] = useState('All Claims');
    const [search, setSearch] = useState('');

    const filteredClaims = mockClaims.filter((claim) => {
        const matchesFilter = filter === 'All Claims' || claim.status === filter || (filter === 'Pending' && (claim.status === 'Pending' || claim.status === 'Active'));
        const matchesTab =
            filter === 'All Claims' ? true :
                filter === 'Pending' ? (claim.status === 'Pending' || claim.status === 'Active') :
                    claim.status === filter;

        const matchesSearch =
            claim.policyName.toLowerCase().includes(search.toLowerCase()) ||
            claim.id.toLowerCase().includes(search.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const counts = {
        'All Claims': mockClaims.length,
        'Pending': mockClaims.filter(c => c.status === 'Pending' || c.status === 'Active').length,
        'Approved': mockClaims.filter(c => c.status === 'Approved').length,
        'Rejected': mockClaims.filter(c => c.status === 'Rejected').length,
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Claims</h1>
                    <p className="text-gray-400">Manage and track your insurance claims</p>
                </div>

                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full rounded-lg bg-transparent border border-slate-700 py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-slate-800 text-sm font-medium text-gray-400">
                    {['All Claims', 'Pending', 'Approved', 'Rejected'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`
              relative pb-3 transition-colors
              ${filter === tab ? 'text-white' : 'hover:text-gray-300'}
            `}
                        >
                            {tab} ({counts[tab as keyof typeof counts]})
                            {filter === tab && (
                                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-cyan-500" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {filteredClaims.map((claim) => (
                        <div
                            key={claim.id}
                            className="group relative overflow-hidden rounded-xl bg-slate-900/50 p-6 transition-all hover:bg-slate-900"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-white">{claim.incidentType}</h3>
                                    <p className="text-sm text-gray-400">
                                        Policy ID: {claim.policyId} • Claim ID: {claim.id}
                                    </p>
                                    <p className="text-sm text-gray-400 max-w-lg">
                                        {claim.description || "Compensation for assets lost during security breach"}
                                    </p>
                                </div>
                                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[claim.status]}`}>
                                    {claim.status}
                                </span>
                            </div>

                            <div className="mt-6 flex items-end gap-12">
                                <div>
                                    <p className="text-xs text-gray-400">Amount Claimed</p>
                                    <p className="text-xl font-bold text-white">{claim.amountFormatted}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Date Filed</p>
                                    <p className="text-lg font-medium text-white">{claim.dateFiled}</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button variant="primary" fullWidth className="!py-2">
                                    View Details
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar Buttons */}
            <div className="flex flex-col gap-3 min-w-[200px]">
                <Link href="/claims/new">
                    <Button variant="primary" fullWidth>
                        <span className="mr-2 text-lg">+</span> New Claim
                    </Button>
                </Link>
                <Button variant="primary" fullWidth>
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    All Claims
                </Button>
            </div>
        </div>
    );
}
