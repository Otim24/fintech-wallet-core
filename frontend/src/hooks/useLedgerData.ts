import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Transaction,
    Balance,
    LedgerAccount,
    FinancialGoal,
    Card,
    Subscription,
    Contact,
    SpendingStats
} from '@/lib/types';

export interface LedgerData {
    balance: Balance | null;
    transactions: Transaction[];
    accounts: LedgerAccount[];
    goals: FinancialGoal[];
    cards: Card[];
    subscriptions: Subscription[];
    contacts: Contact[];
    spendingStats: SpendingStats | null;
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
    const [cards, setCards] = useState<Card[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [spendingStats, setSpendingStats] = useState<SpendingStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSpendingStats = async (period: string) => {
        try {
            const response = await api.get(`/ledger/dashboard/data/?period=${period}`);

            setSpendingStats(response.data);
        } catch (error: any) {
            console.error("Failed to fetch spending stats:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [balRes, txRes, accRes, goalRes, cardRes, subRes, contactRes] = await Promise.allSettled([
                    api.get('/ledger/trial-balance/'),
                    api.get('/ledger/transactions/'),
                    api.get('/ledger/accounts/'),
                    api.get('/ledger/goals/'),
                    api.get('/ledger/cards/'),
                    api.get('/ledger/subscriptions/'),
                    api.get('/ledger/contacts/')
                ]);

                if (balRes.status === 'fulfilled') setBalance(balRes.value.data);

                if (txRes.status === 'fulfilled') {
                    const data = txRes.value.data;
                    console.log("DEBUG: Fetched Transactions", data);
                    const txs = Array.isArray(data) ? data : data.results || [];
                    console.log("DEBUG: Parsed Transactions", txs);
                    setTransactions(txs);
                } else console.warn("Failed fetch transactions", txRes.reason);


                if (accRes.status === 'fulfilled') setAccounts(accRes.value.data);

                if (goalRes.status === 'fulfilled') {
                    const data = goalRes.value.data;
                    setGoals(Array.isArray(data) ? data : data.results || []);
                }

                if (cardRes.status === 'fulfilled') {
                    const data = cardRes.value.data;
                    setCards(Array.isArray(data) ? data : data.results || []);
                }

                if (subRes.status === 'fulfilled') {
                    const data = subRes.value.data;
                    setSubscriptions(Array.isArray(data) ? data : data.results || []);
                }

                if (contactRes.status === 'fulfilled') {
                    const data = contactRes.value.data;
                    setContacts(Array.isArray(data) ? data : data.results || []);
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
        window.location.reload();
    };

    return {
        balance,
        transactions,
        accounts,
        goals,
        cards,
        subscriptions,
        contacts,
        spendingStats,
        loading,
        error,
        refreshData,
        fetchSpendingStats
    };
}
