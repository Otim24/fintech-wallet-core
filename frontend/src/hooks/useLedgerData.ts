import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Transaction {
    id: number;
    amount: number; // calculated from entries usually or provided by view? 
    // TransactionSerializer in backend has 'entries'. It does NOT have 'amount'.
    // We need to calculate amount from entries or update serializer.
    // For now, let's assume we sum entries for the User's account?
    // The backend `TransactionListView` uses `TransactionSerializer`.
    // The `TransactionSerializer` returns `entries`.
    // We need to process this in frontend to show a single "Amount" for the transaction row.
    description: string;
    created_at: string;
    entries: any[];
}

interface Balance {
    total_debits: number;
    total_credits: number;
    net_balance: number;
}

interface LedgerAccount {
    id: string;
    name: string;
    type: string;
    balance: string; // Decimal string
    currency: string;
    created_at: string;
}

export interface FinancialGoal {
    id: string;
    name: string;
    target_amount: string;
    saved_amount: string;
    deadline?: string;
}

export interface LedgerData {
    balance: Balance | null;
    transactions: Transaction[];
    accounts: LedgerAccount[];
    goals: FinancialGoal[];
    spendingStats: {
        total: number;
        percentage_change: number;
        history: { date: string; amount: number }[];
    } | null;
    loading: boolean;
    error: string | null;
    refreshData: () => void;
    fetchSpendingStats: (period: string) => Promise<void>;
}

export function useLedgerData(): LedgerData {
    const [balance, setBalance] = useState<Balance | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [spendingStats, setSpendingStats] = useState<LedgerData['spendingStats']>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSpendingStats = async (period: string) => {
        try {
            const response = await api.get(`/api/ledger/analytics/spending/?period=${period}`);
            setSpendingStats(response.data);
        } catch (error) {
            console.error("Failed to fetch spending stats", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [balRes, txRes, accRes, goalRes] = await Promise.allSettled([
                    api.get('/api/ledger/trial-balance/'),
                    api.get('/api/ledger/transactions/'),
                    api.get('/api/ledger/accounts/'),
                    api.get('/api/ledger/goals/')
                ]);

                if (balRes.status === 'fulfilled') {
                    setBalance(balRes.value.data);
                }

                if (txRes.status === 'fulfilled') {
                    // Handle pagination if results key exists
                    const data = txRes.value.data;
                    setTransactions(Array.isArray(data) ? data : data.results || []);
                } else {
                    console.warn("Failed to fetch transactions", txRes.reason);
                }

                if (accRes.status === 'fulfilled') {
                    setAccounts(accRes.value.data);
                } else {
                    console.warn("Failed to fetch accounts", accRes.reason);
                }

                if (goalRes.status === 'fulfilled') {
                    setGoals(Array.isArray(goalRes.value.data) ? goalRes.value.data : goalRes.value.data.results || []);
                } else {
                    // console.warn("Failed to fetch goals", goalRes.reason); 
                    // Optional feature, might fail if not implemented fully yet
                }

                // Initial spending fetch
                await fetchSpendingStats('12m');

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const refreshData = () => {
        // Re-fetch logic or just reload page
        // For now, simpler to just assume parent re-renders or we modify this to expose a refetch function
        window.location.reload();
    };

    return { balance, transactions, accounts, goals, spendingStats, loading, error, refreshData, fetchSpendingStats };
}
