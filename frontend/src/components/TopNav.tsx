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
        <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
            {/* Left: Logo & Nav */}
            <div className="flex items-center gap-12">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-xs">
                        Py
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {links.map(link => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
                                }`}
                        >
                            {pathname === link.href && <span className="mr-2 text-black">•</span>}
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Right: Search & Profile */}
            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-gray-50 border-none rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none text-gray-700"
                    />
                </div>

                <Bell className="text-gray-400 hover:text-black cursor-pointer" size={20} />

                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-orange-200 rounded-full overflow-hidden">
                        {/* Avatar */}
                        <img src="https://i.pravatar.cc/100?img=12" alt="User" className="h-full w-full object-cover" />
                    </div>
                    <div className="text-xs">
                        <div className="font-bold text-gray-900">Ahmed Wahid</div>
                        <div className="text-gray-400">Account Information</div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
