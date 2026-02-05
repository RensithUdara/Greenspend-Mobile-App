// Greenspend Type Definitions

export type TransactionType = 'income' | 'expense';
export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly' | 'none';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
  date: string; // ISO string
  createdAt: string; // ISO string
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  nextRecurringDate?: string; // ISO string
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string; // Format: 'YYYY-MM'
  createdAt: string;
}

export interface CategorySpending {
  category: string;
  spent: number;
  limit: number;
  percentage: number;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface AppSettings {
  currencySymbol: string;
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

export interface AppData {
  transactions: Transaction[];
  budgets: Budget[];
  customCategories: string[];
  settings: AppSettings;
}

export type AlertLevel = 'safe' | 'warning' | 'danger' | 'exceeded';

export interface BudgetAlert {
  category: string;
  level: AlertLevel;
  percentage: number;
  message: string;
}

// Utility function to generate unique IDs
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Format currency with custom symbol
export const formatCurrency = (amount: number, currencySymbol: string = '$'): string => {
  return `${currencySymbol}${amount.toFixed(2)}`;
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Get current month in YYYY-MM format
export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Get month name from YYYY-MM format
export const getMonthName = (monthString: string): string => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Get alert level based on percentage
export const getAlertLevel = (percentage: number): AlertLevel => {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'danger';
  if (percentage >= 80) return 'warning';
  return 'safe';
};
