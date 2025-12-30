"use client";
import React from 'react';
import { Transaction } from "@/lib/types";
import { ArrowUpRight, ArrowDownLeft, Music, Monitor, ShoppingBag, Coffee } from 'lucide-react';

interface TransactionItemProps {
    transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
    const entry = transaction.entries?.[0];
    const rawAmount = entry ? parseFloat(entry.amount) : 0;
    const isCredit = entry?.type === 'CREDIT';
    const amount = Math.abs(rawAmount).toFixed(2);
    const date = new Date(transaction.created_at);
    // Fallback to "Unknown" if description is missing.
    // Also user snippet suggests checking category, but our type might not have it on top level?
    // Let's assume description is primary.
    const description = transaction.description || "Unknown Merchant";

    // 1. Smart Icon Logic
    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('spotify') || n.includes('music')) return <Music className="text-green-500" />;
        if (n.includes('netflix') || n.includes('adobe')) return <Monitor className="text-red-500" />;
        if (n.includes('amazon') || n.includes('shop')) return <ShoppingBag className="text-orange-500" />;
        // Specific user request mentions 'Apple' -> Grey Icon. Could be Monitor or something else?
        // Let's add Apple explicitly if needed, but the snippet didn't validly import Apple icon or define it?
        // The snippet: "if (n.includes('apple')) return <GreyIcon />" - actually the snippet said "Apple -> Grey Icon" in text, but code didn't show it.
        // It showed: if (n.includes('netflix')...) return Monitor
        // I'll assume Apple -> Monitor (Gray) or Coffee?
        // Let's stick to the code snippet logic provided:
        // if (n.includes('spotify')...) -> Music
        // if (n.includes('netflix')...) -> Monitor
        // if (n.includes('amazon')...) -> ShoppingBag
        // return Coffee

        if (n.includes('apple')) return <Monitor className="text-zinc-400" />; // Added based on text directive

        return <Coffee className="text-zinc-400" />;
    };

    return (
        <div className="flex items-center justify-between p-4 hover:bg-zinc-900/50 rounded-xl transition-colors border-b border-zinc-900 last:border-0">
            <div className="flex items-center gap-4">
                {/* Avatar Circle */}
                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                    {getIcon(description)}
                </div>

                <div>
                    <h4 className="font-bold text-white text-base">{description}</h4>
                    <p className="text-xs text-zinc-500">{date.toLocaleDateString()} • {transaction.category || 'General'}</p>
                </div>
            </div>

            <div className="text-right">
                <span className={`block font-mono font-bold ${isCredit ? 'text-emerald-400' : 'text-white'}`}>
                    {isCredit ? '+' : '-'}${amount}
                </span>
                <div>
                    {transaction.posted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                            COMPLETED
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-500">
                            PENDING
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
