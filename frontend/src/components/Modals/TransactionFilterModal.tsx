"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export interface FilterCriteria {
    type: 'ALL' | 'CREDIT' | 'DEBIT';
    status: 'ALL' | 'COMPLETED' | 'PENDING';
    startDate: string;
    endDate: string;
}

interface TransactionFilterModalProps {
    children: React.ReactNode;
    currentFilters: FilterCriteria;
    onApply: (filters: FilterCriteria) => void;
}

export function TransactionFilterModal({ children, currentFilters, onApply }: TransactionFilterModalProps) {
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState<FilterCriteria>(currentFilters);

    const handleApply = () => {
        onApply(filters);
        setOpen(false);
    };

    const handleReset = () => {
        const defaultFilters: FilterCriteria = {
            type: 'ALL',
            status: 'ALL',
            startDate: '',
            endDate: ''
        };
        setFilters(defaultFilters);
        // Optional: Apply immediately or wait for user to click Apply. Waiting is safer UX.
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950/90 backdrop-blur-xl border-zinc-800 shadow-2xl text-white">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle>Filter Transactions</DialogTitle>
                    {/* <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
                        <X size={18} />
                    </Button> */}
                </DialogHeader>

                <div className="grid gap-6 py-4">

                    {/* Type Filter */}
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Transaction Type</Label>
                        <Select
                            value={filters.type}
                            onValueChange={(val: any) => setFilters({ ...filters, type: val })}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                <SelectItem value="ALL">All Transactions</SelectItem>
                                <SelectItem value="CREDIT">Income (Credit)</SelectItem>
                                <SelectItem value="DEBIT">Expense (Debit)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Status</Label>
                        <Select
                            value={filters.status}
                            onValueChange={(val: any) => setFilters({ ...filters, status: val })}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Start Date</Label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="bg-zinc-900 border-zinc-700 text-white block w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">End Date</Label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="bg-zinc-900 border-zinc-700 text-white block w-full"
                            />
                        </div>
                    </div>

                </div>

                <div className="flex justify-between mt-2">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        Reset
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                            Cancel
                        </Button>
                        <Button onClick={handleApply} className="bg-white text-black hover:bg-zinc-200">
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
