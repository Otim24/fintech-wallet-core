"use client";
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLedgerData } from "@/hooks/useLedgerData";
import { Search, Filter, Download } from "lucide-react";
import { TransactionItem } from "@/components/Transactions/TransactionItem";
import { TransactionFilterModal, FilterCriteria } from "@/components/Modals/TransactionFilterModal";

export default function TransactionsPage() {
    const { transactions, loading } = useLedgerData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<FilterCriteria>({
        type: 'ALL',
        status: 'ALL',
        startDate: '',
        endDate: ''
    });

    // Simple check if filters are active to style the button
    const isFilterActive = filters.type !== 'ALL' || filters.status !== 'ALL' || filters.startDate !== '' || filters.endDate !== '';

    // Filter transactions based on search term AND filters
    const filteredTransactions = transactions.filter(tx => {
        // 1. Search Term (Description or Amount)
        const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.entries?.[0]?.amount || 0).toString().includes(searchTerm);
        if (!matchesSearch) return false;

        // 2. Type Filter
        const entry = tx.entries?.[0];
        if (filters.type !== 'ALL') {
            if (filters.type === 'CREDIT' && entry?.type !== 'CREDIT') return false;
            if (filters.type === 'DEBIT' && entry?.type !== 'DEBIT') return false;
        }

        // 3. Status Filter
        if (filters.status !== 'ALL') {
            const isCompleted = tx.posted;
            if (filters.status === 'COMPLETED' && !isCompleted) return false;
            if (filters.status === 'PENDING' && isCompleted) return false; // Assuming unposted = pending
        }

        // 4. Date Filter
        const txDate = new Date(tx.created_at);
        if (filters.startDate) {
            const start = new Date(filters.startDate);
            // Set start to beginning of day
            start.setHours(0, 0, 0, 0);
            if (txDate < start) return false;
        }
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            // Set end to end of day
            end.setHours(23, 59, 59, 999);
            if (txDate > end) return false;
        }

        return true;
    });

    return (
        <div className="min-h-screen space-y-8 p-6 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">Transactions</h1>
                    <p className="text-zinc-400">View and manage your transaction history. (Loaded: {transactions.length})</p>

                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                        <Download size={16} className="mr-2" /> Export
                    </Button>
                    <Button className="rounded-full bg-white text-black font-bold hover:bg-zinc-200">
                        + New Payment
                    </Button>
                </div>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                    />
                </div>


                <TransactionFilterModal
                    currentFilters={filters}
                    onApply={setFilters}
                >
                    <Button variant="outline" className={`rounded-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 px-6 ${isFilterActive ? 'bg-zinc-800 border-zinc-500 text-white' : ''}`}>
                        <Filter size={16} className="mr-2" /> Filter
                        {isFilterActive && <div className="ml-2 w-2 h-2 rounded-full bg-indigo-500"></div>}
                    </Button>
                </TransactionFilterModal>
            </div>

            {/* Transactions List */}
            <Card className="rounded-[40px] border border-white/5 shadow-2xl bg-zinc-900/40 backdrop-blur-xl overflow-hidden min-h-[400px]">
                <div className="flex flex-col py-2">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex job-center p-6 border-b border-zinc-900/50">
                                <div className="h-12 w-12 rounded-full bg-zinc-800/50 animate-pulse mr-4" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-zinc-800/50 rounded animate-pulse w-32" />
                                    <div className="h-3 bg-zinc-800/50 rounded animate-pulse w-24" />
                                </div>
                            </div>
                        ))
                    ) : filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx) => (
                            <TransactionItem key={tx.id} transaction={tx} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">No transactions found</p>
                            <p className="text-sm">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
