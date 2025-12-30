"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { CardStack } from "@/components/Cards/CardStack";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send, CornerDownLeft, MoreHorizontal, ArrowRight, Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Settings, ChevronDown, Check, X, Plane, Gamepad2, Briefcase, Car } from "lucide-react";
import { useLedgerData } from "@/hooks/useLedgerData";
import { AddGoalModal } from "@/components/Modals/AddGoalModal";
import { TransferModal } from "@/components/Modals/TransferModal";

export default function Dashboard() {
  const { balance, transactions, accounts, goals, spendingStats, loading, refreshData, fetchSpendingStats, cards } = useLedgerData();
  const [activeCardId, setActiveCardId] = useState<string>("");

  useEffect(() => {
    if (cards && cards.length > 0) {
      setActiveCardId(cards[0].id);
    }
  }, [cards]);

  // Format currency
  const formatMoney = (amount: number | string) => {
    const num = Number(amount);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(isNaN(num) ? 0 : num);
  };

  const netBalance = balance ? balance.net_balance : 0;

  // Calculate real Income and Expense from transactions
  const income = transactions.reduce((acc, tx) => {
    const entry = tx.entries?.[0];
    if (!entry) return acc;
    const amt = parseFloat(entry.amount);
    return entry.type === 'CREDIT' ? acc + amt : acc;
  }, 0);

  const expense = transactions.reduce((acc, tx) => {
    const entry = tx.entries?.[0];
    if (!entry) return acc;
    const amt = parseFloat(entry.amount);
    return entry.type === 'DEBIT' ? acc + amt : acc;
  }, 0);

  // Icons mappping for goals
  const goalIcons: any = {
    'Vacation': Plane,
    'Trip': Plane,
    'Laptop': Gamepad2,
    'PC': Gamepad2,
    'Emergency': Briefcase
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="grid grid-cols-12 gap-8">

        {/* LEFT COLUMN: Main Content (72%) */}
        <div className="col-span-12 lg:col-span-9 space-y-8">

          {/* 1. MY CARDS SECTION */}
          <div className="bg-black/40 border border-white/5 rounded-[40px] p-8 overflow-hidden relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 z-10 relative">
              <div>
                <h2 className="text-2xl font-bold text-white">My cards</h2>
                <span className="text-zinc-500 text-xs font-bold">Total {cards.length} cards</span>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full border-zinc-800 text-zinc-400 hover:text-white bg-zinc-900/50 h-10 w-10">
                  <Settings size={18} />
                </Button>
                <Link href="/cards">
                  <Button variant="outline" className="rounded-full border-zinc-800 text-zinc-300 hover:text-white bg-zinc-900/50 text-xs font-bold px-4 h-10">
                    View all
                  </Button>
                </Link>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-col md:flex-row gap-1 items-center z-10 relative">

              {/* CardStack Component */}
              <div className="relative w-full md:w-[380px] h-[320px] flex items-center justify-center">
                {loading ? (
                  <div className="text-zinc-500 font-bold animate-pulse">Loading cards...</div>
                ) : cards.length > 0 ? (
                  <div className="scale-[0.85] origin-top w-full h-full">
                    <CardStack
                      cards={cards}
                      activeId={activeCardId || cards[0]?.id}
                      onSelect={(c) => setActiveCardId(c.id)}
                    />
                  </div>
                ) : (
                  <div className="w-full h-[220px] flex items-center justify-center border border-dashed border-zinc-800 rounded-3xl text-zinc-500 font-bold">
                    No Cards Found
                  </div>
                )}
              </div>

              {/* Stats & Actions */}
              <div className="flex-1 w-full space-y-8 pl-0 md:pl-12">
                <div>
                  <div className="text-zinc-500 text-sm font-bold mb-1">Available amount</div>
                  <div className="text-4xl font-extrabold text-white tracking-tight">{formatMoney(netBalance)}</div>
                </div>

                <div className="flex gap-12">
                  <div>
                    <div className="text-zinc-500 text-xs font-bold mb-1">Total Income</div>
                    <div className="text-lg font-bold text-zinc-200">{formatMoney(income)}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs font-bold mb-1">Total Expense</div>
                    <div className="text-lg font-bold text-zinc-200">{formatMoney(expense)}</div>
                  </div>
                </div>

                {/* Action Pills */}
                <div className="flex gap-3">
                  <Link href="/transactions">
                    <Button size="icon" className="rounded-full bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 shadow-lg h-12 w-12">
                      <Send size={18} />
                    </Button>
                  </Link>
                  <Button size="icon" className="rounded-full bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 shadow-lg h-12 w-12">
                    <MoreHorizontal size={18} />
                  </Button>
                  <Button size="icon" className="rounded-full bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 shadow-lg h-12 w-12">
                    <Settings size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SAVINGS SECTION */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-xl text-white">Savings</h3>
                <span className="text-zinc-500 text-xs font-bold">Total {goals.length || 0} goals</span>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full border-zinc-800 text-zinc-400 hover:text-white bg-zinc-900/50 h-10 w-10">
                  <Settings size={18} />
                </Button>
                <Button variant="outline" className="rounded-full border-zinc-800 text-zinc-300 hover:text-white bg-zinc-900/50 text-xs font-bold px-4 h-10">
                  View all
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? [1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-900/50 animate-pulse rounded-3xl" />) :
                goals.slice(0, 3).map((goal, idx) => {
                  const saved = parseFloat(goal.current_amount);
                  const target = parseFloat(goal.target_amount);
                  const percent = Math.min(Math.round((saved / target) * 100), 100);
                  const Icon = goalIcons[goal.name?.split(' ')?.[0]] || Car;

                  // Colors for bars
                  const barColors = ['bg-lime-400', 'bg-indigo-400', 'bg-orange-400'];
                  const barColor = barColors[idx % barColors.length];

                  return (
                    <div key={goal.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-[30px] hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-sm font-bold text-zinc-400 mb-1">{goal.name}</div>
                          <div className="text-xl font-bold text-white">{formatMoney(saved)}</div>
                        </div>
                        <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-white/30 transition-colors">
                          <Icon size={14} />
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  )
                })
              }
              <AddGoalModal onSuccess={refreshData}>
                <div className="border border-dashed border-zinc-800 p-6 rounded-[30px] flex flex-col items-center justify-center h-full hover:bg-white/5 cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors min-h-[140px]">
                  <Plus size={24} className="mb-2" />
                  <span className="text-xs font-bold">Add New Goal</span>
                </div>
              </AddGoalModal>
            </div>
          </div>

          {/* 3. TRANSACTION SECTION */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-white">Transaction</h3>
              <Button variant="outline" className="rounded-full border-zinc-800 text-zinc-300 hover:text-white bg-zinc-900/50 text-xs font-bold px-4 h-10">
                View all
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? [1, 2].map(i => <div key={i} className="h-20 bg-zinc-900/50 animate-pulse rounded-3xl" />) :
                transactions.slice(0, 4).map((tx) => {
                  const amount = tx.entries?.[0]?.amount || 0;
                  const isCredit = tx.entries?.[0]?.type === 'CREDIT';

                  return (
                    <div key={tx.id} className="flex items-center justify-between p-4 px-6 bg-transparent hover:bg-zinc-900/40 rounded-[24px] transition-colors group border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-5">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isCredit ? 'bg-lime-400/10 text-lime-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                          {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-200 text-base">{tx.description}</div>
                          <div className="text-xs text-zinc-500 font-bold mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className={`font-bold text-base ${isCredit ? 'text-white' : 'text-zinc-200'}`}>
                          {isCredit ? '+' : ''}{formatMoney(amount)}
                        </div>
                        <div className="flex gap-2 text-zinc-600">
                          <div className="h-8 w-8 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                            <div className="w-1 h-1 bg-current rounded-full"></div>
                            <div className="w-1 h-1 bg-current rounded-full mx-0.5"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar (28%) */}
        <div className="col-span-12 lg:col-span-3 space-y-10">

          {/* Quick Action */}
          <div>
            <h3 className="font-bold text-xl text-white mb-6">Quick action</h3>
            <div className="bg-zinc-900/30 border border-white/5 rounded-[40px] p-8">
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                <Link href="/cards">
                  <div className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div className="h-16 w-16 bg-indigo-500/10 rounded-[24px] flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-indigo-500/5">
                      <Plus size={24} />
                    </div>
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">Top up</span>
                  </div>
                </Link>

                <Link href="/subscriptions">
                  <div className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div className="h-16 w-16 bg-indigo-500/10 rounded-[24px] flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-indigo-500/5">
                      <Plane size={24} className="rotate-45" />
                    </div>
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">Pay</span>
                  </div>
                </Link>

                <Link href="/transactions">
                  <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
                    <div className="h-16 w-16 bg-indigo-500/10 rounded-[24px] flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-indigo-500/5">
                      <ArrowUpRight size={24} />
                    </div>
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">Send</span>
                  </div>
                </Link>

                <TransferModal accounts={accounts} onSuccess={refreshData} mode="request">
                  <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
                    <div className="h-16 w-16 bg-indigo-500/10 rounded-[24px] flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-indigo-500/5">
                      <ArrowDownLeft size={24} />
                    </div>
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">Request</span>
                  </div>
                </TransferModal>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-white">Statistics</h3>
              <div className="flex items-center gap-1 text-xs font-bold text-zinc-500 bg-zinc-900 border border-white/5 py-2 px-3 rounded-full cursor-pointer hover:text-white hover:border-white/10">
                Dec 2021 <ChevronDown size={14} />
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-white/5 rounded-[40px] p-8 space-y-8">

              {/* Income */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-lime-400 flex items-center justify-center text-black shadow-lg shadow-lime-400/20">
                    <ArrowDownLeft size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 font-bold mb-0.5">Total Income</div>
                    <div className="text-lg font-bold text-white">{formatMoney(income)}</div>
                  </div>
                </div>
                {/* <div className="bg-lime-400/10 text-lime-400 text-[10px] font-bold px-2 py-1 rounded-full">+20%</div> */}
              </div>

              {/* Expenses */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 font-bold mb-0.5">Total Expenses</div>
                    <div className="text-lg font-bold text-white">{formatMoney(expense)}</div>
                  </div>
                </div>
                {/* <div className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded-full">+8%</div> */}
              </div>

              {/* Savings (Derived) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-black shadow-lg">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 font-bold mb-0.5">Total Savings</div>
                    <div className="text-lg font-bold text-white">{formatMoney(goals.reduce((acc, g) => acc + parseFloat(g.current_amount), 0))}</div>
                  </div>
                </div>
                {/* <div className="bg-orange-400/10 text-orange-400 text-[10px] font-bold px-2 py-1 rounded-full">-12%</div> */}
              </div>

              <Button className="w-full bg-black text-white hover:bg-zinc-900 border border-zinc-800 rounded-2xl h-12 font-bold mt-4">
                View all
              </Button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
