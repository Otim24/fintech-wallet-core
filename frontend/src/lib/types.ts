export interface LedgerAccount {
    id: string;
    name: string;
    type: string;
    balance: string; // Decimal string
    currency: string;
    created_at: string;
}

export interface Card {
    id: string;
    user: number;
    account: string; // UUID of LedgerAccount
    name: string;
    last_4: string;
    type: 'PHYSICAL' | 'VIRTUAL';
    is_frozen: boolean;
    spending_limit: string; // Decimal string
    balance: string;      // Decimal string
    created_at: string;
}

export interface Subscription {
    id: string;
    user: number;
    service_name: string;
    amount: string; // Decimal string
    billing_cycle: string;
    next_billing_date: string;
    logo_url: string;
    is_active: boolean;
    created_at: string;
}

export interface FinancialGoal {
    id: string;
    name: string;
    target_amount: string;
    current_amount: string;
    deadline?: string;
    created_at: string;
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    created_at: string;
}

export interface JournalEntry {
    id: string;
    account: string;
    amount: string;
    type: 'DEBIT' | 'CREDIT';
}

export interface Transaction {
    id: string;
    reference: string;
    description: string;
    category?: string; // Added for UI display
    created_at: string;

    posted: boolean;
    entries: JournalEntry[];
}

export interface Balance {
    is_balanced: boolean;
    total_debits: number;
    total_credits: number;
    net_balance: number;
    accounts: any[]; // Or specific breakdown type
}

export interface SpendingStats {
    total: number;
    percentage_change: number;
    history: { date: string; amount: number }[];
}
