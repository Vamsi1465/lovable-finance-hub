import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useFinanceData } from '@/hooks/useFinanceData';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { TrendLineChart } from '@/components/dashboard/TrendLineChart';
import { PaymentModeChart } from '@/components/dashboard/PaymentModeChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { InsightsCard } from '@/components/dashboard/InsightsCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  calculatePersonalStats, 
  getCategoryBreakdown, 
  getRecentTransactions,
  filterByDateRange 
} from '@/lib/calculations';
import { parseDate } from '@/lib/formatters';
import type { DateFilterType, DateRange } from '@/types/finance';

export const PersonalDashboard = () => {
  const { data, isLoading, error } = useFinanceData();
  const [filterType, setFilterType] = useState<DateFilterType>('monthly');
  const [dateRange, setDateRange] = useState<DateRange>({ 
    from: startOfMonth(new Date()), 
    to: endOfMonth(new Date()) 
  });

  const filteredIncome = useMemo(() => {
    return filterByDateRange(data?.personalIncome || [], dateRange.from, dateRange.to);
  }, [data?.personalIncome, dateRange]);

  const filteredExpense = useMemo(() => {
    return filterByDateRange(data?.personalExpense || [], dateRange.from, dateRange.to);
  }, [data?.personalExpense, dateRange]);

  const stats = useMemo(() => {
    return calculatePersonalStats(
      data?.personalIncome || [], 
      data?.personalExpense || []
    );
  }, [data]);

  const incomeCategories = useMemo(() => {
    return getCategoryBreakdown(filteredIncome.map(i => ({ category: i.category, amount: i.amount })));
  }, [filteredIncome]);

  const expenseCategories = useMemo(() => {
    return getCategoryBreakdown(filteredExpense.map(e => ({ category: e.category, amount: e.amount })));
  }, [filteredExpense]);

  const trendData = useMemo(() => {
    const combined = [
      ...filteredIncome.map(i => ({ date: i.date, income: i.amount, expense: 0 })),
      ...filteredExpense.map(e => ({ date: e.date, income: 0, expense: e.amount })),
    ];

    // Group by date
    const grouped = combined.reduce((acc, item) => {
      const date = parseDate(item.date);
      if (!date) return acc;
      const key = date.toISOString().split('T')[0];
      if (!acc[key]) acc[key] = { date: key, income: 0, expense: 0 };
      acc[key].income += item.income;
      acc[key].expense += item.expense;
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredIncome, filteredExpense]);

  const paymentModeData = useMemo(() => {
    const modes: Record<string, { mode: string; income: number; expense: number }> = {};
    
    filteredIncome.forEach(i => {
      const mode = i.paymentMethod || 'Other';
      if (!modes[mode]) modes[mode] = { mode, income: 0, expense: 0 };
      modes[mode].income += i.amount;
    });
    
    filteredExpense.forEach(e => {
      const mode = e.paymentMethod || 'Other';
      if (!modes[mode]) modes[mode] = { mode, income: 0, expense: 0 };
      modes[mode].expense += e.amount;
    });

    return Object.values(modes);
  }, [filteredIncome, filteredExpense]);

  const recentTransactions = useMemo(() => {
    return getRecentTransactions(filteredIncome, filteredExpense, 10);
  }, [filteredIncome, filteredExpense]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg">Failed to load data</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Personal Finance Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          value={stats.totalIncome}
          growth={stats.incomeGrowth}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="income"
        />
        <SummaryCard
          title="Total Expense"
          value={stats.totalExpense}
          growth={stats.expenseGrowth}
          icon={<TrendingDown className="h-5 w-5" />}
          variant="expense"
        />
        <SummaryCard
          title="Net Balance"
          value={stats.netBalance}
          icon={<Wallet className="h-5 w-5" />}
          variant={stats.netBalance >= 0 ? 'profit' : 'expense'}
        />
        <SummaryCard
          title="This Month"
          value={stats.thisMonthIncome - stats.thisMonthExpense}
          icon={<Calendar className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Date Filter */}
      <DateFilter
        filterType={filterType}
        dateRange={dateRange}
        onFilterTypeChange={setFilterType}
        onDateRangeChange={setDateRange}
      />

      {/* Trend Chart */}
      <TrendLineChart title="Income vs Expense Trend" data={trendData} />

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart title="Income by Category" data={incomeCategories} />
        <CategoryPieChart title="Expense by Category" data={expenseCategories} />
      </div>

      {/* Payment Mode Analysis */}
      <PaymentModeChart data={paymentModeData} />

      {/* Recent Transactions & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={recentTransactions} />
        </div>
        
        <div className="space-y-6">
          <InsightsCard 
            title="Top Spending Categories" 
            categories={expenseCategories} 
            variant="expense"
          />
          <InsightsCard 
            title="Top Income Sources" 
            categories={incomeCategories} 
            variant="income"
          />
          <StatsCard
            title="Quick Stats"
            stats={[
              { label: 'Daily Avg Income', value: stats.totalIncome / 30, isCurrency: true },
              { label: 'Daily Avg Expense', value: stats.totalExpense / 30, isCurrency: true },
              { label: 'Savings Rate', value: stats.savingsRate, isPercentage: true },
              { label: 'Transactions', value: (data?.personalIncome?.length || 0) + (data?.personalExpense?.length || 0) },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
