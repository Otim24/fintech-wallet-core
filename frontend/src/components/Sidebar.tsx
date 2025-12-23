"use client";
import React from 'react';
import { LayoutDashboard, PieChart, ArrowRightLeft, BarChart2, Settings, Twitter, Send, Slack } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
    const pathname = usePathname();

    const links = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
        { name: 'Accounts', icon: PieChart, href: '/accounts' },
        { name: 'Transfer', icon: ArrowRightLeft, href: '/transfer' },
        { name: 'Reports', icon: BarChart2, href: '/reports' },
        { name: 'Settings', icon: Settings, href: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-black text-black dark:text-white flex flex-col p-6 z-40 rounded-r-3xl transition-all duration-300 shadow-xl dark:shadow-none border-r border-gray-200 dark:border-none">
            {/* Logo */}
            <div className="mb-12 flex items-center justify-center">
                <div className="h-10 w-10 flex items-center justify-center text-black dark:text-white transition-colors">
                    {/* Abstract Logo */}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 20C10 14.4772 14.4772 10 20 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <path d="M20 30C25.5228 30 30 25.5228 30 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <path d="M10 30H30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-4">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                                    : 'text-gray-500 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10'}
                            `}
                        >
                            <link.icon size={20} className={isActive ? 'text-current' : 'text-gray-400 group-hover:text-current dark:text-gray-400'} />
                            <span>{link.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer Socials */}
            <div className="mt-auto flex justify-between px-4 pt-8 border-t border-gray-800">
                <Twitter size={18} className="text-gray-500 hover:text-white cursor-pointer" />
                <Send size={18} className="text-gray-500 hover:text-white cursor-pointer" />
                <Slack size={18} className="text-gray-500 hover:text-white cursor-pointer" />
            </div>
        </aside>
    );
}
