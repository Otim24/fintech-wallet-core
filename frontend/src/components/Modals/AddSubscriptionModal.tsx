"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";

interface AddSubscriptionModalProps {
    children: React.ReactNode;
    onSuccess?: () => void;
}

export function AddSubscriptionModal({ children, onSuccess }: AddSubscriptionModalProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [cycle, setCycle] = useState("Monthly");
    const [nextDate, setNextDate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/api/ledger/subscriptions/", {
                service_name: name,
                amount: parseFloat(amount),
                billing_cycle: cycle,
                next_billing_date: nextDate,
                is_active: true
            });
            setOpen(false);
            setName("");
            setAmount("");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to create subscription", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950/80 backdrop-blur-xl border-zinc-800 shadow-2xl text-zinc-50">
                <DialogHeader>
                    <DialogTitle className="text-white">Add Subscription</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-zinc-400">Service Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Netflix"
                            className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="text-zinc-400">Monthly Cost</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="15.99"
                            className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cycle" className="text-zinc-400">Billing Cycle</Label>
                        <Select onValueChange={setCycle} defaultValue={cycle}>
                            <SelectTrigger className="bg-zinc-900/50 border-zinc-700 text-white">
                                <SelectValue placeholder="Select cycle" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="Monthly">Monthly</SelectItem>
                                <SelectItem value="Yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="date" className="text-zinc-400">Next Billing Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={nextDate}
                            onChange={(e) => setNextDate(e.target.value)}
                            className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-zinc-800 text-zinc-400 hover:text-white">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {loading ? "Adding..." : "Add Subscription"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
