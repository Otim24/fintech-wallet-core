"use client";
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send, CornerDownLeft, MoreHorizontal, ArrowRight, Laptop, Home, Car } from "lucide-react";
import { useLedgerData } from "@/hooks/useLedgerData";

export default function Dashboard() {
  const { balance, transactions, accounts, loading } = useLedgerData();

  // Format currency
  const formatMoney = (amount: number | string) => {
    const num = Number(amount);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(isNaN(num) ? 0 : num);
  };

  const netBalance = balance ? balance.net_balance : 0;

  return (
    <div className="space-y-6">
      {/* Top Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Balance & Actions Section */}
        <Card className="col-span-12 lg:col-span-4 p-8 rounded-[30px] border-none shadow-sm bg-white">
          <div className="flex gap-6 mb-8 text-sm font-bold text-gray-400">
            <span className="text-black border-b-2 border-black pb-1 cursor-pointer">Checking</span>
            <span className="cursor-pointer hover:text-gray-600">Savings</span>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                {loading ? '...' : formatMoney(netBalance)}
              </h1>
              <Button className="bg-black text-white rounded-full px-4 h-10 text-xs font-bold hover:bg-gray-800">
                + Add account
              </Button>
            </div>
            <p className="text-gray-400 text-sm font-medium">Available balance</p>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <Button className="bg-black text-white rounded-full px-6 h-12 font-bold hover:bg-gray-800">Send</Button>
            <Button variant="outline" className="rounded-full px-6 h-12 font-bold border-gray-200 text-gray-500 hover:text-black">Request</Button>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-gray-200 text-gray-500 hover:text-black">
              <MoreHorizontal size={20} />
            </Button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Contacts</h3>
              <ArrowRight size={18} className="text-gray-400 cursor-pointer hover:text-black" />
            </div>
            <div className="flex gap-[-8px]">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-white overflow-hidden -ml-2 first:ml-0 bg-gray-200">
                  <img src={`https://i.pravatar.cc/100?img=${20 + i}`} alt="Contact" />
                </div>
              ))}
              <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center -ml-2 text-gray-500 text-xs font-bold cursor-pointer hover:bg-gray-200">
                +
              </div>
            </div>
          </div>
        </Card>

        {/* Cards Section */}
        <Card className="col-span-12 lg:col-span-8 p-8 rounded-[30px] border-none shadow-sm bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-900">Cards</h3>
            <span className="text-sm text-gray-400 cursor-pointer hover:text-black">Manage cards</span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {/* Card 1 */}
            <div className="min-w-[300px] h-[180px] bg-gray-200 rounded-2xl p-6 flex flex-col justify-between relative">
              <div className="flex justify-end"><span className="font-bold italic text-gray-600">VISA</span></div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-black rounded-full flex items-center justify-center text-white text-[8px] font-bold">Py</div>
                <span className="font-bold text-gray-700">Premium</span>
              </div>
            </div>
            {/* Card 2 */}
            <div className="min-w-[300px] h-[180px] bg-gray-300 rounded-2xl p-6 flex flex-col justify-between relative">
              <div className="flex justify-end"><span className="font-bold italic text-gray-600">VISA</span></div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-black rounded-full flex items-center justify-center text-white text-[8px] font-bold">Py</div>
                <span className="font-bold text-gray-700">Premium</span>
              </div>
            </div>
            {/* Add Card */}
            <div className="min-w-[100px] h-[180px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
              <Plus size={24} />
              <span className="text-xs font-bold">Add card</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Financial Goals */}
        <Card className="col-span-12 lg:col-span-7 p-8 rounded-[30px] border-none shadow-sm bg-white">
          <h3 className="font-bold text-xl text-gray-900 mb-6">Financial goals</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Goal 1 */}
            <div className="border border-gray-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Home size={20} className="text-gray-600" />
                </div>
                <div>
                  <div className="font-bold text-sm">New house</div>
                  <div className="text-xs text-gray-400">Budget $35,789.00</div>
                </div>
              </div>
              <div className="relative h-10 w-10 flex items-center justify-center font-bold text-xs">
                75%
                <svg className="absolute inset-0" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="black" strokeWidth="3" strokeDasharray="75, 100" />
                </svg>
              </div>
            </div>
            {/* Goal 2 */}
            <div className="border border-gray-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Car size={20} className="text-gray-600" />
                </div>
                <div>
                  <div className="font-bold text-sm">New car</div>
                  <div className="text-xs text-gray-400">Budget $28,999.00</div>
                </div>
              </div>
              <div className="relative h-10 w-10 flex items-center justify-center font-bold text-xs">
                35%
                <svg className="absolute inset-0" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="black" strokeWidth="3" strokeDasharray="35, 100" />
                </svg>
              </div>
            </div>
            {/* Goal 3 */}
            <div className="border border-gray-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Laptop size={20} className="text-gray-600" />
                </div>
                <div>
                  <div className="font-bold text-sm">Macbook Pro M2</div>
                  <div className="text-xs text-gray-400">Budget $2,999.00</div>
                </div>
              </div>
              <div className="relative h-10 w-10 flex items-center justify-center font-bold text-xs">
                55%
                <svg className="absolute inset-0" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="black" strokeWidth="3" strokeDasharray="55, 100" />
                </svg>
              </div>
            </div>
            {/* Add Goal */}
            <div className="border border-gray-100 border-dashed p-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 text-gray-500 font-bold text-sm">
              <Plus size={16} /> Add goals
            </div>
          </div>
        </Card>

        {/* Transactions Section */}
        <Card className="col-span-12 lg:col-span-5 p-8 rounded-[30px] border-none shadow-sm bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-900">Transactions</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full cursor-pointer">
              7 days <span className="text-xs">▼</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between text-xs text-gray-400 font-medium px-2">
              <span>Recipient</span>
              <span>Status</span>
              <span>Date</span>
              <span>Amount</span>
            </div>
            {/* List */}
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-50 animate-pulse rounded-lg" />)
            ) : transactions.slice(0, 3).map((tx, i) => {
              const amount = tx.entries?.[0]?.amount || 0;
              const isCredit = tx.entries?.[0]?.type === 'CREDIT';

              return (
                <div key={i} className="flex items-center justify-between text-sm py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 w-1/4">
                    <div className="h-8 w-8 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                      <img src={`https://i.pravatar.cc/100?img=${30 + i}`} alt="User" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-gray-900 truncate">{tx.description}</div>
                      <div className="text-[10px] text-gray-400 truncate">user@email.com</div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${isCredit ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}`}>
                    {isCredit ? 'Success' : 'Pending'}
                  </span>

                  <span className="text-xs text-gray-500 font-bold">{new Date(tx.created_at).toLocaleDateString()}</span>

                  <span className="font-bold text-gray-900 text-right w-16">
                    {formatMoney(amount)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Spending Chart Section */}
      <Card className="p-8 rounded-[30px] border-none shadow-sm bg-white">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-gray-900 font-bold mb-2">Spending</h3>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-extrabold tracking-tight">$352,254.036</span>
              <span className="text-green-500 text-sm font-bold flex items-center">↗ 5.6%</span>
            </div>
          </div>
          <div className="flex bg-gray-100 rounded-full p-1">
            <button className="px-4 py-2 bg-black text-white text-xs font-bold rounded-full shadow-sm">12 months</button>
            <button className="px-4 py-2 text-gray-500 text-xs font-bold hover:text-black">30 days</button>
            <button className="px-4 py-2 text-gray-500 text-xs font-bold hover:text-black">7 days</button>
            <button className="px-4 py-2 text-gray-500 text-xs font-bold hover:text-black">24 hours</button>
          </div>
        </div>

        {/* Mock Bar Chart matching image style */}
        <div className="h-48 flex items-end justify-between gap-1">
          {[...Array(40)].map((_, i) => {
            const height = Math.floor(Math.random() * 80) + 20;
            return (
              <div key={i} className="flex-1 bg-gray-200 rounded-t-sm hover:bg-gray-300 transition-colors" style={{ height: `${height}%` }}></div>
            )
          })}
        </div>
      </Card>
    </div>
  );
}
