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

export function useLedgerData() {
    const [balance, setBalance] = useState<Balance | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [balRes, txRes, accRes] = await Promise.allSettled([
                    api.get('/ledger/trial-balance/'),
                    api.get('/ledger/transactions/'),
                    api.get('/ledger/accounts/')
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

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { balance, transactions, accounts, loading, error };
}
