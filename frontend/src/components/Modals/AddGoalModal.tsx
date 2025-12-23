"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

interface AddGoalModalProps {
    children: React.ReactNode;
    onSuccess?: () => void;
}

export function AddGoalModal({ children, onSuccess }: AddGoalModalProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/ledger/goals/", {
                name,
                target_amount: parseFloat(targetAmount),
            });
            setOpen(false);
            setName("");
            setTargetAmount("");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to create goal", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/80 dark:bg-zinc-950/50 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl text-zinc-950 dark:text-zinc-50">
                <DialogHeader>
                    <DialogTitle>Add Financial Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-zinc-950 dark:text-zinc-50">Goal Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. New Car"
                            className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-700/50 text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-500"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="text-zinc-950 dark:text-zinc-50">Target Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            placeholder="0.00"
                            className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-700/50 text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent border-zinc-200/50 dark:border-zinc-700/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                            {loading ? "Saving..." : "Save Goal"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
