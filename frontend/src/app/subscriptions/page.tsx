"use client";
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Tv, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useLedgerData } from "@/hooks/useLedgerData";
import { AddSubscriptionModal } from '@/components/Modals/AddSubscriptionModal';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function SubscriptionsPage() {
    const { subscriptions, loading, refreshData } = useLedgerData();

    const totalCost = subscriptions.reduce((acc, sub) => acc + Number(sub.amount), 0);

    const handleDelete = async (id: string) => {
        // Simple confirmation
        if (!confirm("Are you sure you want to cancel this subscription?")) return;

        try {
            await api.delete(`/api/ledger/subscriptions/${id}/`);
            toast.success("Subscription cancelled successfully");
            refreshData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to cancel subscription");
        }
    };

    if (loading && subscriptions.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-white animate-pulse">Loading Subscriptions...</div>
            </div>
        );
    }

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
                    {subscriptions.length > 0 ? subscriptions.map((sub) => (
                        <Card key={sub.id} className="p-6 rounded-[30px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl flex items-center justify-between group hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-6">
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden bg-zinc-800`}>
                                    {sub.logo_url ? (
                                        <img src={sub.logo_url} alt={sub.service_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Tv size={28} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-zinc-200 transition-colors">{sub.service_name}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-zinc-300">{sub.billing_cycle}</span>
                                        <span>•</span>
                                        <span>Next billing: {new Date(sub.next_billing_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <div className="text-xl font-bold text-white">${sub.amount}</div>
                                    <div className="text-xs text-green-500 flex items-center justify-end gap-1">
                                        <CheckCircle2 size={10} /> {sub.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleDelete(sub.id)}
                                    variant="outline"
                                    className="border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 rounded-full"
                                >
                                    <Trash2 size={16} className="mr-2" /> Cancel
                                </Button>
                            </div>
                        </Card>
                    )) : (
                        <div className="text-zinc-500 text-center py-10">No subscriptions found</div>
                    )}
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

                    <AddSubscriptionModal onSuccess={refreshData}>
                        <Card className="p-6 rounded-[30px] border border-dashed border-zinc-800 bg-transparent flex flex-col items-center justify-center text-center py-12 cursor-pointer hover:bg-white/5 transition-colors hover:border-zinc-600">
                            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                                <Plus size={24} />
                            </div>
                            <h4 className="font-bold text-zinc-300">Add Subscription</h4>
                            <p className="text-xs text-zinc-500 mt-1">Track external payments</p>
                        </Card>
                    </AddSubscriptionModal>
                </div>
            </div>
        </div>
    );
}
