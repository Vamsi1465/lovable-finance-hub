import type { 
  PersonalIncome, 
  PersonalExpense, 
  AgencyIncome, 
  AgencyExpense,
  PersonalDashboardStats,
  AgencyDashboardStats,
  CategoryBreakdown,
  Transaction
} from '@/types/finance';
import { parseDate } from './formatters';

// Calculate personal dashboard stats
export const calculatePersonalStats = (
  income: PersonalIncome[],
  expense: PersonalExpense[]
): PersonalDashboardStats => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expense.reduce((sum, item) => sum + item.amount, 0);
  
  // This month's data
  const thisMonthIncome = income
    .filter(item => {
      const date = parseDate(item.date);
      return date && date >= startOfMonth;
    })
    .reduce((sum, item) => sum + item.amount, 0);
  
  const thisMonthExpense = expense
    .filter(item => {
      const date = parseDate(item.date);
      return date && date >= startOfMonth;
    })
    .reduce((sum, item) => sum + item.amount, 0);

  // Last month's data for growth calculation
  const lastMonthIncome = income
    .filter(item => {
      const date = parseDate(item.date);
      return date && date >= startOfLastMonth && date <= endOfLastMonth;
    })
    .reduce((sum, item) => sum + item.amount, 0);
  
  const lastMonthExpense = expense
    .filter(item => {
      const date = parseDate(item.date);
      return date && date >= startOfLastMonth && date <= endOfLastMonth;
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const incomeGrowth = lastMonthIncome > 0 
    ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 
    : 0;
  
  const expenseGrowth = lastMonthExpense > 0 
    ? ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100 
    : 0;

  const savingsRate = totalIncome > 0 
    ? ((totalIncome - totalExpense) / totalIncome) * 100 
    : 0;

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    thisMonthIncome,
    thisMonthExpense,
    incomeGrowth,
    expenseGrowth,
    savingsRate,
  };
};

// Calculate agency dashboard stats
export const calculateAgencyStats = (
  income: AgencyIncome[],
  expense: AgencyExpense[]
): AgencyDashboardStats => {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expense.reduce((sum, item) => sum + item.amount, 0);
  
  const recurringRevenue = income
    .filter(item => item.recurring)
    .reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate upcoming payments in next 7 days
  const upcomingPayments = [...income, ...expense]
    .filter(item => {
      if (!item.nextPaymentDate) return false;
      const nextDate = parseDate(item.nextPaymentDate);
      return nextDate && nextDate >= now && nextDate <= sevenDaysFromNow;
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const uniqueClients = new Set(income.map(item => item.clientName)).size;
  
  const profitMargin = totalIncome > 0 
    ? ((totalIncome - totalExpense) / totalIncome) * 100 
    : 0;

  // Calculate average monthly expense as burn rate
  const expensesByMonth = expense.reduce((acc, item) => {
    const date = parseDate(item.date);
    if (date) {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      acc[monthKey] = (acc[monthKey] || 0) + item.amount;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const monthlyExpenses = Object.values(expensesByMonth);
  const burnRate = monthlyExpenses.length > 0 
    ? monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length 
    : 0;

  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    recurringRevenue,
    upcomingPayments,
    profitMargin,
    burnRate,
    clientCount: uniqueClients,
  };
};

// Get category breakdown with colors
const categoryColors = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
  '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1',
];

export const getCategoryBreakdown = (
  data: Array<{ category: string; amount: number }>
): CategoryBreakdown[] => {
  const grouped = data.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(grouped).reduce((a, b) => a + b, 0);
  
  return Object.entries(grouped)
    .map(([category, amount], index) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: categoryColors[index % categoryColors.length],
    }))
    .sort((a, b) => b.amount - a.amount);
};

// Combine income and expense for recent transactions
export const getRecentTransactions = (
  income: PersonalIncome[],
  expense: PersonalExpense[],
  limit: number = 10
): Transaction[] => {
  const incomeTransactions: Transaction[] = income.map(item => ({
    date: item.date,
    type: 'income' as const,
    name: item.name,
    category: item.category,
    amount: item.amount,
    paymentMethod: item.paymentMethod,
  }));

  const expenseTransactions: Transaction[] = expense.map(item => ({
    date: item.date,
    type: 'expense' as const,
    name: item.name,
    category: item.category,
    amount: item.amount,
    paymentMethod: item.paymentMethod,
  }));

  return [...incomeTransactions, ...expenseTransactions]
    .sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);
};

// Filter data by date range
export const filterByDateRange = <T extends { date: string }>(
  data: T[],
  from: Date | undefined,
  to: Date | undefined
): T[] => {
  if (!from && !to) return data;
  
  return data.filter(item => {
    const itemDate = parseDate(item.date);
    if (!itemDate) return true;
    
    if (from && itemDate < from) return false;
    if (to && itemDate > to) return false;
    
    return true;
  });
};
