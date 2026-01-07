// Personal Finance Types
export interface PersonalIncome {
  date: string;
  name: string;
  category: string;
  amount: number;
  paymentMethod: string;
  reason: string;
}

export interface PersonalExpense {
  date: string;
  name: string;
  category: string;
  amount: number;
  paymentMethod: string;
  reason: string;
}

// Agency Finance Types
export interface AgencyIncome {
  date: string;
  clientName: string;
  service: string;
  amount: number;
  recurring: boolean;
  paymentMode: string;
  reason: string;
  nextPaymentDate: string | null;
}

export interface AgencyExpense {
  date: string;
  category: string;
  paidTo: string;
  amount: number;
  recurring: boolean;
  paymentMode: string;
  reason: string;
  nextPaymentDate: string | null;
}

// Dashboard Stats
export interface PersonalDashboardStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  incomeGrowth: number;
  expenseGrowth: number;
  savingsRate: number;
}

export interface AgencyDashboardStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  recurringRevenue: number;
  upcomingPayments: number;
  profitMargin: number;
  burnRate: number;
  clientCount: number;
}

// API Response Types
export interface SheetsData {
  personalIncome: PersonalIncome[];
  personalExpense: PersonalExpense[];
  agencyIncome: AgencyIncome[];
  agencyExpense: AgencyExpense[];
  lastUpdated: string;
}

// Filter Types
export type DateFilterType = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// Category breakdown for charts
export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// Transaction for combined view
export interface Transaction {
  date: string;
  type: 'income' | 'expense';
  name: string;
  category: string;
  amount: number;
  paymentMethod: string;
}
