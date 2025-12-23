"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";

interface Account {
    id: string;
    name: string;
    balance: string;
}

interface TransferModalProps {
    children: React.ReactNode;
    accounts: Account[];
    onSuccess?: () => void;
    mode?: 'send' | 'request';
}

export function TransferModal({ children, accounts, onSuccess, mode = 'send' }: TransferModalProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const [description, setDescription] = useState("");
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const isRequest = mode === 'request';
    const title = isRequest ? "Request Money" : "Send Money";
    const accountLabel = isRequest ? "To Account (Deposit)" : "From Account";
    const counterpartyLabel = isRequest ? "Request From (Email)" : "Recipient Email";
    const actionLabel = isRequest ? "Request Money" : "Send Money";
    const loadingLabel = isRequest ? "Requesting..." : "Sending...";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccountId) return;

        setLoading(true);
        try {
            // Logic:
            // Send: Debit Selected Account -> Credit External/Other (Simulated by checking for other account or failing)
            // Request: Credit Selected Account -> Debit External/Other (Simulated)

            // For Demo:
            // If Send: Debit `selectedAccountId`, Credit `targetAccount` (Self transfer logic for now)
            // If Request: Credit `selectedAccountId`, Debit `targetAccount` (Simulated "Incoming" transfer)

            // Finding a target account for the double-entry (User's other account)
            const targetAccount = accounts.find(a => a.id !== selectedAccountId);

            // If no other account exists, we can't do a valid ledger entry without a System account.
            // For the sake of the demo, if we are Requesting (Simulating Inflow), maybe just Credit the account and Debit the SAME account? No that's net zero.
            // Only if > 1 account.
            if (!targetAccount) {
                alert("Need at least 2 accounts to simulate transfer/request for now.");
                setLoading(false);
                return;
            }

            const entries = [];

            if (isRequest) {
                // Request: Money COMES IN to Selected Account (Credit), Money LEAVES Target (Debit - simulating external payment source)
                entries.push({
                    account_id: selectedAccountId,
                    amount: parseFloat(amount),
                    type: "CREDIT"
                });
                entries.push({
                    account_id: targetAccount.id,
                    amount: parseFloat(amount),
                    type: "DEBIT"
                });
            } else {
                // Send: Money LEAVES Selected Account (Debit), Money GOES TO Target (Credit)
                entries.push({
                    account_id: selectedAccountId,
                    amount: parseFloat(amount),
                    type: "DEBIT"
                });
                entries.push({
                    account_id: targetAccount.id,
                    amount: parseFloat(amount),
                    type: "CREDIT"
                });
            }

            await api.post("/ledger/transactions/create/", {
                description: description || `${isRequest ? 'Request from' : 'Transfer to'} ${recipient}`,
                entries: entries
            });

            setOpen(false);
            setAmount("");
            setRecipient("");
            setDescription("");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to process transaction", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/80 dark:bg-zinc-950/50 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl text-zinc-950 dark:text-zinc-50">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="account" className="text-zinc-950 dark:text-zinc-50">{accountLabel}</Label>
                        <Select onValueChange={setSelectedAccountId} value={selectedAccountId}>
                            <SelectTrigger className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-700/50 text-zinc-950 dark:text-zinc-50">
                                <SelectValue placeholder="Select Account" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-zinc-200 dark:border-zinc-800">
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.name} (${acc.balance})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="counterparty" className="text-zinc-950 dark:text-zinc-50">{counterpartyLabel}</Label>
                        <Input
                            id="counterparty"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="friend@example.com"
                            className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-700/50 text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-500"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="text-zinc-950 dark:text-zinc-50">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-700/50 text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-500"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description" className="text-zinc-950 dark:text-zinc-50">Description</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Dinner, Rent, etc."
                            className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-700/50 text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-500"
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent border-zinc-200/50 dark:border-zinc-700/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !selectedAccountId} className="bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                            {loading ? loadingLabel : actionLabel}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
