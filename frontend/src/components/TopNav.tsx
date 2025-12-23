"use client";
import React from 'react';
import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function TopNav() {
    const pathname = usePathname();
    const links = [
        { name: 'Dashboard', href: '/' },
        { name: 'Wallet', href: '/wallet' },
        { name: 'Statistic', href: '/statistic' },
        { name: 'Transactions', href: '/transactions' },
    ];

    return (
        <nav className="relative flex items-center justify-between px-8 py-6 bg-zinc-950">
            {/* Left: Logo */}
            <div className="flex items-center gap-2 z-10">
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">
                    Py
                </div>
            </div>

            {/* Center: Glassmorphic Pill Nav */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center gap-1 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2 shadow-2xl">
                    {links.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                        ? 'bg-zinc-800 text-white shadow-lg'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Right: Search & Profile */}
            <div className="flex items-center gap-6 z-10">
                {/* Search */}
                <div className="relative w-64 hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-full py-2.5 pl-10 pr-4 text-xs focus:outline-none text-zinc-200 placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-white/10 transition-colors"
                    />
                </div>

                <Bell className="text-zinc-400 hover:text-white cursor-pointer transition-colors" size={20} />

                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
                        {/* Avatar */}
                        <img src="https://i.pravatar.cc/100?img=12" alt="User" className="h-full w-full object-cover" />
                    </div>
                    <div className="hidden md:block text-xs">
                        <div className="font-bold text-zinc-200">Ahmed Wahid</div>
                        <div className="text-zinc-500">Account Information</div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
