"use client";
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Eye, EyeOff, Snowflake, ShieldCheck, CreditCard, Plus } from "lucide-react";

export default function CardsPage() {
    const [frozen, setFrozen] = useState(false);
    const [revealPin, setRevealPin] = useState(false);
    const [limit, setLimit] = useState([2000]);

    return (
        <div className="min-h-screen space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-white mb-2">My Cards</h1>
                <p className="text-zinc-400">Manage your physical and virtual cards securely.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Physical Card Display */}
                <div className="space-y-6">
                    <Card className="p-8 rounded-[40px] border border-white/5 shadow-2xl bg-zinc-900/40 backdrop-blur-xl flex flex-col items-center justify-center min-h-[400px]">
                        {/* The Large Card */}
                        <div className={`relative w-[380px] h-[240px] rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 shadow-2xl border border-white/10 ${frozen ? 'grayscale bg-zinc-800' : 'bg-gradient-to-br from-zinc-900 to-black'
                            }`}>
                            {/* Glossy overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none" />

                            <div className="flex justify-between items-start z-10">
                                <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xs font-bold border border-white/20">Py</div>
                                <span className="text-white/60 font-bold italic">VISA</span>
                            </div>

                            <div className="z-10">
                                <div className="text-2xl font-mono text-white tracking-widest mb-4 flex items-center gap-2">
                                    <span>4582</span>
                                    <span>••••</span>
                                    <span>••••</span>
                                    <span>8821</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Card Holder</div>
                                        <div className="text-sm font-bold text-white">AHMED WAHID</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Expires</div>
                                        <div className="text-sm font-bold text-white">12/28</div>
                                    </div>
                                </div>
                            </div>

                            {frozen && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl backdrop-blur-[2px] z-20">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full text-white font-bold border border-white/10">
                                        <Snowflake size={16} /> Frozen
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <Button className="rounded-full bg-white text-black font-bold hover:bg-zinc-200">
                                <Plus size={16} className="mr-2" /> Add to Apple Wallet
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Settings Panel */}
                <div className="space-y-6">
                    <Card className="p-8 rounded-[40px] border border-white/5 shadow-2xl bg-zinc-900/40 backdrop-blur-xl space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <ShieldCheck className="text-green-500" /> Security Control
                            </h3>

                            {/* Freeze Toggle */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Snowflake size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">Freeze Card</div>
                                        <div className="text-xs text-zinc-500">Temporarily disable all transactions</div>
                                    </div>
                                </div>
                                <Switch checked={frozen} onCheckedChange={setFrozen} />
                            </div>

                            {/* PIN Reveal */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">Card PIN</div>
                                        <div className="text-xs text-zinc-500">View your 4-digit PIN securely</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setRevealPin(!revealPin)} className="text-white hover:bg-white/10">
                                    {revealPin ? <div className="font-mono text-lg font-bold">8821</div> : <div className="flex gap-1"><span className="w-2 h-2 bg-white rounded-full" /><span className="w-2 h-2 bg-white rounded-full" /><span className="w-2 h-2 bg-white rounded-full" /><span className="w-2 h-2 bg-white rounded-full" /></div>}
                                    <span className="ml-2 bg-white/10 p-1 rounded-md">
                                        {revealPin ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </span>
                                </Button>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-bold text-white mb-6">Spending Limits</h3>
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <div className="flex justify-between mb-4">
                                    <span className="text-sm font-bold text-zinc-400">Monthly Limit</span>
                                    <span className="text-xl font-bold text-white">${limit[0].toLocaleString()}</span>
                                </div>
                                <Slider
                                    defaultValue={[2000]}
                                    max={5000}
                                    step={100}
                                    value={limit}
                                    onValueChange={setLimit}
                                    className="mb-2"
                                />
                                <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase">
                                    <span>$0</span>
                                    <span>$5,000</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Virtual Cards Teaser */}
                    <Card className="p-6 rounded-[30px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                                <Plus size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-white">Create Virtual Card</div>
                                <div className="text-xs text-zinc-500">Safe for online subscriptions</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
