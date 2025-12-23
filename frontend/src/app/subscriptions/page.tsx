"use client";
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, AlertCircle, Music, Tv, Cloud, Command, CheckCircle2, Plus } from "lucide-react";

export default function SubscriptionsPage() {
    const subscriptions = [
        { id: 1, name: 'Netflix Premium', cost: 15.99, date: '24th', icon: Tv, color: 'bg-red-500', status: 'Active' },
        { id: 2, name: 'Spotify Duo', cost: 12.99, date: '28th', icon: Music, color: 'bg-green-500', status: 'Active' },
        { id: 3, name: 'Adobe Creative Cloud', cost: 54.99, date: '1st', icon: Cloud, color: 'bg-blue-600', status: 'Active' },
        { id: 4, name: 'Vercel Pro', cost: 20.00, date: '15th', icon: Command, color: 'bg-black border border-white/20', status: 'Active' },
    ];

    const totalCost = subscriptions.reduce((acc, sub) => acc + sub.cost, 0);

    return (
        <div className="min-h-screen space-y-8">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">Subscriptions</h1>
                    <p className="text-zinc-400">Track and manage your recurring payments.</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Monthly Fixed Cost</div>
                    <div className="text-3xl font-extrabold text-white">${totalCost.toFixed(2)}</div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                {/* Main List */}
                <div className="col-span-12 lg:col-span-8 space-y-4">
                    {subscriptions.map((sub) => (
                        <Card key={sub.id} className="p-6 rounded-[30px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl flex items-center justify-between group hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-6">
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${sub.color}`}>
                                    <sub.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-zinc-200 transition-colors">{sub.name}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-zinc-300">Monthly</span>
                                        <span>•</span>
                                        <span>Next billing: {sub.date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <div className="text-xl font-bold text-white">${sub.cost}</div>
                                    <div className="text-xs text-green-500 flex items-center justify-end gap-1">
                                        <CheckCircle2 size={10} /> {sub.status}
                                    </div>
                                </div>
                                <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 rounded-full">
                                    Manage
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Insights / Alert Panel */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <Card className="p-8 rounded-[40px] border border-white/5 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <AlertCircle size={100} className="text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 relative z-10">Insight</h3>
                        <p className="text-zinc-400 text-sm mb-6 relative z-10 font-medium leading-relaxed">
                            You're spending <span className="text-white font-bold">15% more</span> on subscriptions compared to last month. Adobe Creative Cloud price increased by $2.00.
                        </p>
                        <Button className="w-full rounded-full bg-white text-black font-bold hover:bg-zinc-200 relative z-10">
                            View Report
                        </Button>
                    </Card>

                    <Card className="p-6 rounded-[30px] border border-dashed border-zinc-800 bg-transparent flex flex-col items-center justify-center text-center py-12 cursor-pointer hover:bg-white/5 transition-colors hover:border-zinc-600">
                        <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                            <Plus size={24} />
                        </div>
                        <h4 className="font-bold text-zinc-300">Add Subscription</h4>
                        <p className="text-xs text-zinc-500 mt-1">Track external payments</p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
