"use client";
import { LayoutDashboard, Bell, LogOut, User, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const { setTheme, theme } = useTheme();

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 px-8 z-50 rounded-b-xl shadow-lg transition-all duration-300 backdrop-blur-md 
        bg-[#0a0a0a]/90 text-white 
        dark:bg-white/90 dark:text-black
        hover:backdrop-blur-xl hover:shadow-2xl
    ">
            <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <LayoutDashboard className="text-black" size={18} />
                    </div>
                    <span className="font-bold text-lg hidden md:block">Fintech Core</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="opacity-80 hover:opacity-100 font-medium transition-colors">Dashboard</Link>
                    <Link href="/transactions" className="opacity-80 hover:opacity-100 font-medium transition-colors">Transactions</Link>
                    <Link href="/cards" className="opacity-80 hover:opacity-100 font-medium transition-colors">Cards</Link>
                    <Link href="/reports" className="opacity-80 hover:opacity-100 font-medium transition-colors">Reports</Link>
                </div>

                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-current hover:bg-white/10 dark:hover:bg-black/10 rounded-full">
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <button className="opacity-80 hover:opacity-100 transition-colors">
                        <Bell size={20} />
                    </button>
                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                        <User className="text-gray-500" size={20} />
                    </div>
                    <button className="opacity-80 hover:opacity-100 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
