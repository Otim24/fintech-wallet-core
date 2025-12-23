"use client";
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send, CornerDownLeft, MoreHorizontal, ArrowRight, Laptop, Home, Car } from "lucide-react";
import { useLedgerData, FinancialGoal } from "@/hooks/useLedgerData";
import { AddGoalModal } from "@/components/Modals/AddGoalModal";
import { TransferModal } from "@/components/Modals/TransferModal";

export default function Dashboard() {
  const { balance, transactions, accounts, goals, spendingStats, loading, refreshData, fetchSpendingStats } = useLedgerData();

  // Format currency
  const formatMoney = (amount: number | string) => {
    const num = Number(amount);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(isNaN(num) ? 0 : num);
  };

  const netBalance = balance ? balance.net_balance : 0;

  return (
    <div className="min-h-screen bg-zinc-950 p-6 space-y-6">
      {/* Top Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Balance & Actions Section */}
        <Card className="col-span-12 lg:col-span-4 p-8 rounded-[40px] border border-white/5 shadow-2xl bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex gap-6 mb-8 text-sm font-bold text-zinc-500">
            <span className="text-white border-b-2 border-white pb-1 cursor-pointer">Checking</span>
            <span className="cursor-pointer hover:text-zinc-300 transition-colors">Savings</span>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                {loading ? '...' : formatMoney(netBalance)}
              </h1>
              <Button className="bg-white text-black rounded-full px-4 h-10 text-xs font-bold hover:bg-zinc-200 transition-colors">
                + Add account
              </Button>
            </div>
            <p className="text-zinc-400 text-sm font-medium">Available balance</p>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <TransferModal accounts={accounts} onSuccess={refreshData}>
              <Button className="bg-white text-black rounded-full px-6 h-12 font-bold hover:bg-zinc-200 transition-colors">Send</Button>
            </TransferModal>
            <TransferModal accounts={accounts} onSuccess={refreshData} mode="request">
              <Button variant="outline" className="rounded-full px-6 h-12 font-bold border-zinc-700 bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all">Request</Button>
            </TransferModal>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-zinc-700 bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all">
              <MoreHorizontal size={20} />
            </Button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white">Contacts</h3>
              <ArrowRight size={18} className="text-zinc-500 cursor-pointer hover:text-white transition-colors" />
            </div>
            <div className="flex gap-[-8px]">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-zinc-900 overflow-hidden -ml-2 first:ml-0 bg-zinc-800">
                  <img src={`https://i.pravatar.cc/100?img=${20 + i}`} alt="Contact" />
                </div>
              ))}
              <div className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center -ml-2 text-zinc-400 text-xs font-bold cursor-pointer hover:bg-zinc-700 hover:text-white transition-colors">
                +
              </div>
            </div>
          </div>
        </Card>

        {/* Cards Section */}
        <Card className="col-span-12 lg:col-span-8 p-8 rounded-[40px] border border-white/5 shadow-2xl bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-white">Cards</h3>
            <span className="text-sm text-zinc-500 cursor-pointer hover:text-white transition-colors">Manage cards</span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {/* Card 1 - Black Glass */}
            <div className="min-w-[300px] h-[180px] bg-gradient-to-br from-zinc-800 to-black rounded-3xl p-6 flex flex-col justify-between relative border border-white/10 shadow-lg group hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-end"><span className="font-bold italic text-zinc-400">VISA</span></div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white text-[10px] font-bold border border-white/20">Py</div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm">Platinum Card</span>
                  <span className="text-xs text-zinc-500">**** 4582</span>
                </div>
              </div>
            </div>
            {/* Card 2 - White/Glass Variant */}
            <div className="min-w-[300px] h-[180px] bg-gradient-to-br from-white to-zinc-200 rounded-3xl p-6 flex flex-col justify-between relative border border-white/10 shadow-lg group hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-end"><span className="font-bold italic text-zinc-400">VISA</span></div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center text-black text-[10px] font-bold border border-black/10">Py</div>
                <div className="flex flex-col">
                  <span className="font-bold text-black text-sm">Standard Card</span>
                  <span className="text-xs text-zinc-500">**** 8821</span>
                </div>
              </div>
            </div>
            {/* Add Card */}
            <div className="min-w-[100px] h-[180px] border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-2 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors bg-white/5">
              <Plus size={24} />
              <span className="text-xs font-bold">Add card</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Financial Goals */}
        <Card className="col-span-12 lg:col-span-7 p-8 rounded-[40px] border border-white/5 shadow-2xl bg-zinc-900/40 backdrop-blur-xl">
          <h3 className="font-bold text-xl text-white mb-6">Financial goals</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-24 bg-zinc-800/50 animate-pulse rounded-2xl" />)
            ) : goals.map((goal) => {
              const saved = parseFloat(goal.saved_amount);
              const target = parseFloat(goal.target_amount);
              const percent = Math.min(Math.round((saved / target) * 100), 100);

              return (
                <div key={goal.id} className="border border-white/5 bg-white/5 p-4 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5">
                      <Car size={20} className="text-zinc-300" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{goal.name}</div>
                      <div className="text-xs text-zinc-500">Budget {formatMoney(target)}</div>
                    </div>
                  </div>
                  <div className="relative h-12 w-12 flex items-center justify-center font-bold text-xs text-white">
                    {percent}%
                    <svg className="absolute inset-0 rotate-[-90deg]" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#27272a" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white" strokeWidth="3" strokeDasharray={`${percent}, 100`} strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              );
            })}

            {/* Add Goal */}
            <AddGoalModal onSuccess={refreshData}>
              <div className="border border-zinc-800 border-dashed p-4 rounded-3xl flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 text-zinc-500 hover:text-zinc-300 font-bold text-sm h-full transition-colors">
                <Plus size={16} /> Add goals
              </div>
            </AddGoalModal>
          </div>
        </Card>

        {/* Transactions Section */}
        <Card className="col-span-12 lg:col-span-5 p-8 rounded-[40px] border border-white/5 shadow-2xl bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-white">Transactions</h3>
            <div className="flex items-center gap-1 text-sm text-zinc-400 bg-white/5 border border-white/5 px-4 py-2 rounded-full cursor-pointer hover:bg-white/10 hover:text-white transition-colors">
              7 days <span className="text-xs ml-1">▼</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-600 font-bold uppercase tracking-wider px-2 mb-2">
              <span>Recipient</span>
              <span>Status</span>
              <span>Date</span>
              <span>Amount</span>
            </div>
            {/* List */}
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-zinc-800/50 animate-pulse rounded-2xl" />)
            ) : transactions.slice(0, 4).map((tx, i) => {
              const amount = tx.entries?.[0]?.amount || 0;
              const isCredit = tx.entries?.[0]?.type === 'CREDIT';

              return (
                <div key={i} className="flex items-center justify-between text-sm py-3 px-3 hover:bg-white/5 rounded-2xl transition-colors cursor-default group">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="h-10 w-10 bg-zinc-800 rounded-full overflow-hidden flex-shrink-0 border border-white/5">
                      <img src={`https://i.pravatar.cc/100?img=${30 + i}`} alt="User" className="opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-zinc-200 truncate group-hover:text-white transition-colors">{tx.description}</div>
                      <div className="text-[10px] text-zinc-500 truncate">user@email.com</div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${isCredit ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {isCredit ? 'Received' : 'Pending'}
                  </span>

                  <span className="text-xs text-zinc-500 font-bold">{new Date(tx.created_at).toLocaleDateString()}</span>

                  <span className={`font-bold text-right w-20 ${isCredit ? 'text-green-400' : 'text-zinc-200'}`}>
                    {isCredit ? '+' : ''}{formatMoney(amount)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Spending Chart Section */}
      <Card className="p-8 rounded-[40px] border border-white/5 shadow-2xl bg-zinc-900/40 backdrop-blur-xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-white font-bold mb-2 text-lg">Spending</h3>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-extrabold tracking-tight text-white">
                {spendingStats ? formatMoney(spendingStats.total) : "$0.00"}
              </span>
              {spendingStats && (
                <span className={`text-sm font-bold flex items-center px-2 py-1 rounded-full ${spendingStats.percentage_change >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {spendingStats.percentage_change >= 0 ? '↗' : '↘'} {Math.abs(spendingStats.percentage_change)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex bg-zinc-900/50 rounded-full p-1 border border-white/5">
            {['12m', '30d', '7d', '24h'].map((period) => (
              <button
                key={period}
                onClick={() => fetchSpendingStats(period)}
                className="px-5 py-2 hover:bg-zinc-800 focus:bg-white focus:text-black text-zinc-500 text-xs font-bold rounded-full transition-all duration-300"
              >
                {period === '12m' ? '12 months' : period === '30d' ? '30 days' : period === '7d' ? '7 days' : '24 hours'}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Bar Chart */}
        <div className="h-48 flex items-end justify-between gap-1.5">
          {(() => {
            const history = spendingStats?.history || [];
            const maxAmount = Math.max(...history.map(h => h.amount), 1);

            if (history.length === 0) {
              return <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm font-medium border border-dashed border-zinc-800 rounded-3xl">No spending data for this period</div>
            }

            return history.map((item, i) => {
              const height = (item.amount / maxAmount) * 100;
              // Gradient bars
              return (
                <div key={i} className="flex-1 bg-zinc-800/50 hover:bg-white rounded-full transition-all duration-300 group relative flex items-end overflow-hidden" style={{ height: `${Math.max(height, 5)}%` }}>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block bg-zinc-800 text-white border border-white/10 text-[10px] py-1 px-2 rounded-lg whitespace-nowrap z-10 shadow-xl font-bold">
                    {item.date}: {formatMoney(item.amount)}
                  </span>
                </div>
              )
            })
          })()}
        </div>
      </Card>
    </div>
  );
}
