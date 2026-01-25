'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const navItems = [
    {
        name: 'Dashboard', href: '/dashboard', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        )
    },
    {
        name: 'Policies', href: '/policies', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        )
    },
    {
        name: 'Claims', href: '/claims', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        )
    },
    {
        name: 'Wallet', href: '/wallet', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        )
    },
    {
        name: 'Payments', href: '/payments', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        )
    },
    {
        name: 'Settings', href: '/settings', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        )
    },
    {
        name: 'Help & Support', href: '/support', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )
    },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="fixed left-4 top-4 bottom-4 z-40 w-64 rounded-3xl border-2 border-white/60 bg-slate-950 px-4 py-6 shadow-2xl">
            <div className="mb-10 flex items-center justify-center gap-2 px-2">
                {/* Logo - Matching the design text style */}
                <div className="text-xl font-bold text-white">
                    Stellar<span className="text-cyan-500">Insured</span>
                </div>
            </div>

            <nav className="flex flex-col h-[calc(100%-4rem)] justify-between">
                <div className="space-y-1">
                    {navItems.slice(0, 5).map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                    group flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-bold transition-all
                    ${isActive
                                        ? 'bg-slate-800 text-white shadow-lg'
                                        : 'text-white hover:bg-slate-800/50 hover:text-white'
                                    }
                  `}
                            >
                                <div className={`${isActive ? 'text-white' : 'text-white group-hover:text-white'}`}>
                                    {item.icon}
                                </div>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="space-y-1 pb-6">
                    {navItems.slice(5).map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                     group flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-bold transition-all
                     ${isActive
                                        ? 'bg-slate-800 text-white shadow-lg'
                                        : 'text-white hover:bg-slate-800/50 hover:text-white'
                                    }
                   `}
                            >
                                <div className={`${isActive ? 'text-white' : 'text-white group-hover:text-white'}`}>
                                    {item.icon}
                                </div>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </aside>
    );
};
