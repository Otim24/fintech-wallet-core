"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, ArrowUpRight, ArrowDownLeft, Bell, Trash2, Snowflake, Play } from "lucide-react";
import { CardStack } from "@/components/Cards/CardStack";
import { useLedgerData } from "@/hooks/useLedgerData";
import { Card } from "@/lib/types";
import { AddCardModal } from "@/components/Modals/AddCardModal";
import api from "@/lib/api";
import { toast } from "sonner";

export default function WalletPage() {
    const { transactions, cards, loading, refreshData } = useLedgerData();
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const [activeTab, setActiveTab] = useState('All Payments');

    useEffect(() => {
        if (cards.length > 0 && !activeCard) {
            setActiveCard(cards[0]);
        }
    }, [cards, activeCard]);

    const formatMoney = (amount: number | string) => {
        const num = Number(amount);
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(isNaN(num) ? 0 : num);
    };

    const handleFreeze = async () => {
        if (!activeCard) return;
        const newStatus = !activeCard.is_frozen;
        try {
            await api.patch(`/api/ledger/cards/${activeCard.id}/`, { is_frozen: newStatus });
            toast.success(`Card ${newStatus ? 'frozen' : 'unfrozen'}`);
            refreshData();
            // Optimistically update
            setActiveCard({ ...activeCard, is_frozen: newStatus });
        } catch (e) {
            console.error(e);
            toast.error("Failed to update card status");
        }
    };

    const handleDelete = async () => {
        if (!activeCard) return;
        if (!confirm("Are you sure you want to delete this card? This cannot be undone.")) return;
        try {
            await api.delete(`/api/ledger/cards/${activeCard.id}/`);
            toast.success("Card deleted");
            refreshData();
            setActiveCard(null);
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete card");
        }
    };

    if (loading && cards.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-white animate-pulse">Loading Wallet...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row gap-12 pt-4">

            {/* LEFT COLUMN: Wallet & Balance */}
            <div className="w-full lg:w-[400px] flex-shrink-0 space-y-10">
                <header>
                    <h1 className="text-2xl font-bold text-white mb-8">My Wallets</h1>
                </header>

                {/* Card Stack Container */}
                <div className="h-[400px] relative w-full">
                    {/* @ts-ignore */}
                    <CardStack cards={cards} onSelect={setActiveCard} activeId={activeCard?.id || ''} />
                </div>

                {/* Balance Info */}
                <div className="space-y-6">
                    <div>
                        <div className="text-zinc-500 text-sm font-bold mb-1">Your Balance</div>
                        <div className="flex items-end gap-4 mb-2">
                            <span className="text-4xl font-extrabold text-white tracking-tight">
                                {activeCard ? formatMoney(activeCard.balance) : '$0.00'}
                            </span>
                        </div>
                        <div className="flex gap-4 text-xs font-bold">
                            <div className="flex items-center text-green-400">
                                <ArrowUpRight size={14} className="mr-1" /> 23.65%
                            </div>
                            <div className="flex items-center text-red-400">
                                <ArrowDownLeft size={14} className="mr-1" /> 10.40%
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 border-t border-b border-white/5 py-6">
                        <Button
                            onClick={handleFreeze}
                            variant="outline"
                            className={`flex-1 rounded-xl font-bold transition-colors ${activeCard?.is_frozen ? 'bg-blue-500/10 text-blue-400 border-blue-500/50 hover:bg-blue-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                        >
                            {activeCard?.is_frozen ? <Play size={16} className="mr-2" /> : <Snowflake size={16} className="mr-2" />}
                            {activeCard?.is_frozen ? 'Unfreeze' : 'Freeze'}
                        </Button>

                        <Button
                            onClick={handleDelete}
                            variant="outline"
                            className="flex-1 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 font-bold transition-colors"
                        >
                            <Trash2 size={16} className="mr-2" /> Delete
                        </Button>
                    </div>

                    <AddCardModal onSuccess={refreshData}>
                        <Button className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold text-sm shadow-xl transition-transform hover:scale-[1.02]">
                            <Plus size={18} className="mr-2" /> Add New Card
                        </Button>
                    </AddCardModal>
                </div>
            </div>

            {/* RIGHT COLUMN: Payments & History */}
            <div className="flex-1 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white">My Payments</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Bell className="text-zinc-400 hover:text-white cursor-pointer transition-colors" size={20} />
                            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-zinc-950"></div>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-full transition-colors">
                            <img src="https://i.pravatar.cc/100?img=12" alt="User" className="h-8 w-8 rounded-full border border-white/10" />
                            <span className="text-sm font-bold text-white hidden md:block">Mahfuzul Nabil</span>
                        </div>
                    </div>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-4 gap-4">
                    <div className="flex gap-8 relative">
                        {['All Payments', 'Regular Payments'].map(tab => (
                            <div
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`cursor-pointer pb-4 text-sm font-bold transition-colors relative ${activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {tab}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                        <Search size={16} />
                        <span className="text-xs font-bold">Search</span>
                    </div>
                </div>

                {/* Payments List */}
                <div className="space-y-6">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-6">Recent Transactions</div>

                    {loading ? [1, 2, 3].map(i => <div key={i} className="h-16 bg-zinc-900/50 animate-pulse rounded-2xl" />) :
                        transactions.length > 0 ? transactions.slice(0, 5).map((tx, idx) => {
                            // Only show if amount > 0 or it has entries
                            // For simplicity, mock amount from entries or fallback
                            const amount = tx.entries?.[0]?.amount || (Math.random() * 500);
                            const isCredit = idx % 2 === 0;

                            const colors = ['bg-orange-500', 'bg-blue-500', 'bg-black border border-white/20', 'bg-indigo-500'];
                            const initials = ['TX', 'PY', 'TR', 'SP'];

                            return (
                                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-3xl transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-full ${colors[idx % 4]} flex items-center justify-center text-white font-bold shadow-lg`}>
                                            {initials[idx % 4]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-base group-hover:text-zinc-200">{tx.description || "Transfer"}</div>
                                            <div className="text-xs text-zinc-500 font-bold mt-1">{new Date(tx.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className={`font-bold text-base ${isCredit ? 'text-white' : 'text-zinc-200'}`}>
                                        {isCredit ? '+' : '-'}{formatMoney(amount)}
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="text-zinc-500 text-sm">No transactions found.</div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
