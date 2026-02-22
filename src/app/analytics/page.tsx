"use client";

import React, { useEffect, useState } from "react";
import { analytics, AnalyticsEvent } from "@/lib/analytics";
import { ProtectedRoute } from "@/components/protected-route";
import { Activity, MousePointerClick, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

export default function AnalyticsDashboard() {
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        const data = analytics.getAnalyticsData();
        // Sort by newest first
        setEvents(data.sort((a, b) => b.timestamp - a.timestamp));
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const clearData = () => {
        if (confirm("Are you sure you want to clear all local analytics data?")) {
            analytics.clearData();
            loadData();
        }
    };

    // Compute stats
    const pageViews = events.filter((e) => e.type === "PAGE_VIEW").length;
    const actions = events.filter((e) => e.type === "ACTION").length;
    const errors = events.filter((e) => e.type === "ERROR").length;

    // Group page views by path for a simple bar chart / list
    const viewsByPath = events
        .filter((e) => e.type === "PAGE_VIEW")
        .reduce((acc, e) => {
            acc[e.path] = (acc[e.path] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    const topPaths = Object.entries(viewsByPath)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <ProtectedRoute>
            <div className="flex flex-col gap-8 mt-8 p-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Analytics Dashboard</h2>
                        <p className="text-brand-text-muted">
                            Internal metrics and usage tracking (Local Storage)
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={loadData}
                            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition"
                        >
                            <RefreshCw size={18} />
                            Refresh
                        </button>
                        <button
                            onClick={clearData}
                            className="flex items-center gap-2 bg-rose-500/20 text-rose-400 px-4 py-2 rounded-lg font-medium hover:bg-rose-500/30 transition border border-rose-500/20"
                        >
                            <Trash2 size={18} />
                            Clear Data
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-gray-400">Loading metrics...</div>
                ) : (
                    <div className="grid gap-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#1e2440]/50 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                                <div className="p-4 bg-sky-500/20 text-sky-400 rounded-xl">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400">Total Page Views</h3>
                                    <p className="text-3xl font-bold text-white mt-1">{pageViews}</p>
                                </div>
                            </div>

                            <div className="bg-[#1e2440]/50 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                                <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                    <MousePointerClick size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400">User Actions</h3>
                                    <p className="text-3xl font-bold text-white mt-1">{actions}</p>
                                </div>
                            </div>

                            <div className="bg-[#1e2440]/50 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                                <div className="p-4 bg-rose-500/20 text-rose-400 rounded-xl">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400">Errors Captured</h3>
                                    <p className="text-3xl font-bold text-white mt-1">{errors}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Popular Pages */}
                            <div className="bg-[#1e2440]/50 p-6 rounded-2xl border border-white/5 col-span-1">
                                <h3 className="text-lg font-semibold text-white mb-4">Popular Pages</h3>
                                <div className="space-y-4">
                                    {topPaths.length > 0 ? topPaths.map(([path, count]) => {
                                        const maxCount = topPaths[0][1];
                                        const percentage = Math.round((count / maxCount) * 100);
                                        return (
                                            <div key={path}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-300 truncate pr-4">{path}</span>
                                                    <span className="font-medium text-white">{count}</span>
                                                </div>
                                                <div className="w-full bg-slate-800 rounded-full h-2">
                                                    <div
                                                        className="bg-brand-primary h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }) : <p className="text-sm text-gray-500">No page view data available.</p>}
                                </div>
                            </div>

                            {/* Event Log */}
                            <div className="bg-[#1e2440]/50 p-6 rounded-2xl border border-white/5 col-span-1 lg:col-span-2 flex flex-col h-96">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Events Log</h3>
                                <div className="overflow-y-auto pr-2 flex-grow space-y-3 custom-scrollbar">
                                    {events.length > 0 ? events.map((event) => (
                                        <div key={event.id} className="p-3 bg-slate-900/40 rounded-lg flex items-start gap-3 border border-white/5">
                                            <div className="mt-0.5">
                                                {event.type === "PAGE_VIEW" && <span className="w-2 h-2 rounded-full bg-sky-400 block mt-1.5" />}
                                                {event.type === "ACTION" && <span className="w-2 h-2 rounded-full bg-emerald-400 block mt-1.5" />}
                                                {event.type === "ERROR" && <span className="w-2 h-2 rounded-full bg-rose-400 block mt-1.5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {event.name} <span className="text-gray-500 font-normal">({event.category})</span>
                                                    </p>
                                                    <span className="text-xs text-gray-500 shrink-0 ml-4">
                                                        {new Date(event.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 font-mono truncate">
                                                    {event.path}
                                                </p>
                                                {event.data && Object.keys(event.data).length > 0 && (
                                                    <pre className="mt-2 text-[10px] text-gray-400 bg-black/30 p-2 rounded overflow-x-auto">
                                                        {JSON.stringify(event.data, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-500 text-center mt-10">No events recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
        </ProtectedRoute>
    );
}
