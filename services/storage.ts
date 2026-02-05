// Greenspend Local Storage Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Budget, AppData, AppSettings, generateId, getCurrentMonth, RecurringFrequency } from '@/types';
import { DefaultCategories } from '@/constants/theme';

const STORAGE_KEYS = {
  TRANSACTIONS: 'greenspend_transactions',
  BUDGETS: 'greenspend_budgets',
  CUSTOM_CATEGORIES: 'greenspend_custom_categories',
  SETTINGS: 'greenspend_settings',
} as const;

// Initialize with sample data for demo purposes
const getSampleTransactions = (): Transaction[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  return [
    {
      id: generateId(),
      amount: 3200,
      type: 'income',
      category: 'Salary',
      note: 'Monthly salary',
      date: threeDaysAgo.toISOString(),
      createdAt: threeDaysAgo.toISOString(),
    },
    {
      id: generateId(),
      amount: 12.50,
      type: 'expense',
      category: 'Dining',
      note: 'Starbucks',
      date: today.toISOString(),
      createdAt: today.toISOString(),
    },
    {
      id: generateId(),
      amount: 125.40,
      type: 'expense',
      category: 'Groceries',
      note: 'Whole Foods',
      date: yesterday.toISOString(),
      createdAt: yesterday.toISOString(),
    },
    {
      id: generateId(),
      amount: 45.00,
      type: 'expense',
      category: 'Transport',
      note: 'Gas station',
      date: twoDaysAgo.toISOString(),
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: generateId(),
      amount: 1200,
      type: 'expense',
      category: 'Rent',
      note: 'Monthly rent',
      date: threeDaysAgo.toISOString(),
      createdAt: threeDaysAgo.toISOString(),
    },
  ];
};

const getSampleBudgets = (): Budget[] => {
  const currentMonth = getCurrentMonth();
  return [
    {
      id: generateId(),
      category: 'Groceries',
      limit: 400,
      month: currentMonth,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      category: 'Dining',
      limit: 200,
      month: currentMonth,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      category: 'Rent',
      limit: 1200,
      month: currentMonth,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      category: 'Transport',
      limit: 150,
      month: currentMonth,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      category: 'Entertainment',
      limit: 100,
      month: currentMonth,
      createdAt: new Date().toISOString(),
    },
  ];
};

// Transactions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (data) {
      return JSON.parse(data);
    }
    // Return empty array - no sample data
    return [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    const transactions = await getTransactions();
    transactions.unshift(transaction); // Add to beginning
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    const transactions = await getTransactions();
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
      transactions[index] = transaction;
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    const transactions = await getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Budgets
export const getBudgets = async (): Promise<Budget[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (data) {
      return JSON.parse(data);
    }
    // Return empty array - no sample data
    return [];
  } catch (error) {
    console.error('Error getting budgets:', error);
    return [];
  }
};

export const saveBudget = async (budget: Budget): Promise<void> => {
  try {
    const budgets = await getBudgets();
    // Check if budget for this category and month already exists
    const existingIndex = budgets.findIndex(
      b => b.category === budget.category && b.month === budget.month
    );
    if (existingIndex !== -1) {
      budgets[existingIndex] = budget;
    } else {
      budgets.push(budget);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budget:', error);
    throw error;
  }
};

export const deleteBudget = async (id: string): Promise<void> => {
  try {
    const budgets = await getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

// Custom Categories
export const getCustomCategories = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting custom categories:', error);
    return [];
  }
};

export const saveCustomCategory = async (category: string): Promise<void> => {
  try {
    const categories = await getCustomCategories();
    if (!categories.includes(category)) {
      categories.push(category);
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(categories));
    }
  } catch (error) {
    console.error('Error saving custom category:', error);
    throw error;
  }
};

export const getAllCategories = async (): Promise<string[]> => {
  const customCategories = await getCustomCategories();
  return [...DefaultCategories, ...customCategories];
};

// Analytics helpers
export const getTransactionsForMonth = async (month: string): Promise<Transaction[]> => {
  const transactions = await getTransactions();
  return transactions.filter(t => {
    const txMonth = t.date.substring(0, 7);
    return txMonth === month;
  });
};

export const getBudgetsForMonth = async (month: string): Promise<Budget[]> => {
  const budgets = await getBudgets();
  return budgets.filter(b => b.month === month);
};

export const getMonthlyStats = async (month: string) => {
  const transactions = await getTransactionsForMonth(month);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    month,
    income,
    expenses,
    balance: income - expenses,
  };
};

export const getCategorySpending = async (month: string) => {
  const transactions = await getTransactionsForMonth(month);
  const budgets = await getBudgetsForMonth(month);

  const expensesByCategory: Record<string, number> = {};

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

  return Object.entries(expensesByCategory).map(([category, spent]) => {
    const budget = budgets.find(b => b.category === category);
    const limit = budget?.limit || 0;
    return {
      category,
      spent,
      limit,
      percentage: limit > 0 ? (spent / limit) * 100 : 0,
    };
  });
};

// App Settings
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
    // Return default settings
    return {
      currencySymbol: '$',
      hasCompletedOnboarding: false,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      currencySymbol: '$',
      hasCompletedOnboarding: false,
      createdAt: new Date().toISOString(),
    };
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

// Recurring Transactions
export const getRecurringTransactions = async (): Promise<Transaction[]> => {
  const transactions = await getTransactions();
  return transactions.filter(t => t.isRecurring);
};

export const getUpcomingBills = async (daysAhead: number = 7): Promise<Transaction[]> => {
  const recurring = await getRecurringTransactions();
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return recurring.filter(t => {
    if (!t.nextRecurringDate) return false;
    const nextDate = new Date(t.nextRecurringDate);
    return nextDate >= now && nextDate <= futureDate;
  }).sort((a, b) => {
    const dateA = new Date(a.nextRecurringDate!);
    const dateB = new Date(b.nextRecurringDate!);
    return dateA.getTime() - dateB.getTime();
  });
};

export const calculateNextRecurringDate = (date: string, frequency: RecurringFrequency): string => {
  const currentDate = new Date(date);
  const nextDate = new Date(currentDate);

  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      return date;
  }

  return nextDate.toISOString();
};

// CSV Export
export const exportTransactionsToCSV = async (): Promise<string> => {
  const transactions = await getTransactions();

  // CSV Header
  let csv = 'Date,Type,Category,Amount,Note\n';

  // CSV Rows
  transactions.forEach(t => {
    const date = new Date(t.date).toLocaleDateString();
    const type = t.type.charAt(0).toUpperCase() + t.type.slice(1);
    const note = t.note.replace(/,/g, ';'); // Replace commas to avoid CSV issues
    csv += `${date},${type},${t.category},${t.amount},"${note}"\n`;
  });

  return csv;
};

// Clear all data (for testing/reset)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.BUDGETS,
      STORAGE_KEYS.CUSTOM_CATEGORIES,
      STORAGE_KEYS.SETTINGS,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};
