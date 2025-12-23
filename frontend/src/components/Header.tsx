"use client";
import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function Header() {
    const { setTheme, resolvedTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <header className="flex items-center justify-between py-5 mb-8">
            {/* Search */}
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-white dark:bg-zinc-900 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none shadow-sm text-gray-700 dark:text-gray-200"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <div className="relative">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
                    </div>
                </Button>

                <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                    {/* Placeholder Avatar */}
                    <User className="h-full w-full p-2 text-gray-500" />
                </div>
            </div>
        </header>
    );
}
