import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { FilterDropdowns } from '@/components/dashboard/FilterDropdowns';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { TrendLineChart } from '@/components/dashboard/TrendLineChart';
import { PaymentModeChart } from '@/components/dashboard/PaymentModeChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { InsightsCard } from '@/components/dashboard/InsightsCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DashboardCustomizer, getDefaultPersonalWidgets, DashboardWidget } from '@/components/dashboard/DashboardCustomizer';
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
  
  // Default to monthly
  const [filterType, setFilterType] = useState<DateFilterType>('monthly');
  const [dateRange, setDateRange] = useState<DateRange>({ 
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  });
  
  // Category and Payment Method filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All');
  
  // Dashboard customization
  const [widgets, setWidgets] = useState<DashboardWidget[]>(getDefaultPersonalWidgets());

  const isWidgetEnabled = (id: string) => widgets.find(w => w.id === id)?.enabled ?? true;

  // Get all categories and payment methods for dropdowns
  const allCategories = useMemo(() => {
    const incomeCategories = data?.personalIncome?.map(i => i.category) || [];
    const expenseCategories = data?.personalExpense?.map(e => e.category) || [];
    return [...incomeCategories, ...expenseCategories];
  }, [data]);

  const allPaymentMethods = useMemo(() => {
    const incomeMethods = data?.personalIncome?.map(i => i.paymentMethod) || [];
    const expenseMethods = data?.personalExpense?.map(e => e.paymentMethod) || [];
    return [...incomeMethods, ...expenseMethods];
  }, [data]);

  const filteredIncome = useMemo(() => {
    let filtered = filterByDateRange(data?.personalIncome || [], dateRange.from, dateRange.to);
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(i => i.category === selectedCategory);
    }
    if (selectedPaymentMethod !== 'All') {
      filtered = filtered.filter(i => i.paymentMethod === selectedPaymentMethod);
    }
    return filtered;
  }, [data?.personalIncome, dateRange, selectedCategory, selectedPaymentMethod]);

  const filteredExpense = useMemo(() => {
    let filtered = filterByDateRange(data?.personalExpense || [], dateRange.from, dateRange.to);
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }
    if (selectedPaymentMethod !== 'All') {
      filtered = filtered.filter(e => e.paymentMethod === selectedPaymentMethod);
    }
    return filtered;
  }, [data?.personalExpense, dateRange, selectedCategory, selectedPaymentMethod]);

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Personal Finance Dashboard</h2>
        <DashboardCustomizer widgets={widgets} onWidgetsChange={setWidgets} />
      </div>

      {/* Summary Cards */}
      {isWidgetEnabled('summary-cards') && (
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
      )}

      {/* Date Filter and Dropdowns */}
      {isWidgetEnabled('date-filter') && (
        <div className="space-y-4">
          <DateFilter
            filterType={filterType}
            dateRange={dateRange}
            onFilterTypeChange={setFilterType}
            onDateRangeChange={setDateRange}
          />
          <FilterDropdowns
            categories={allCategories}
            paymentMethods={allPaymentMethods}
            selectedCategory={selectedCategory}
            selectedPaymentMethod={selectedPaymentMethod}
            onCategoryChange={setSelectedCategory}
            onPaymentMethodChange={setSelectedPaymentMethod}
          />
        </div>
      )}

      {/* Trend Chart */}
      {isWidgetEnabled('trend-chart') && (
        <TrendLineChart title="Income vs Expense Trend" data={trendData} />
      )}

      {/* Category Breakdown */}
      {(isWidgetEnabled('income-categories') || isWidgetEnabled('expense-categories')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isWidgetEnabled('income-categories') && (
            <CategoryPieChart title="Income by Category" data={incomeCategories} />
          )}
          {isWidgetEnabled('expense-categories') && (
            <CategoryPieChart title="Expense by Category" data={expenseCategories} />
          )}
        </div>
      )}

      {/* Payment Mode Analysis */}
      {isWidgetEnabled('payment-modes') && (
        <PaymentModeChart data={paymentModeData} />
      )}

      {/* Recent Transactions & Insights */}
      {(isWidgetEnabled('recent-transactions') || isWidgetEnabled('insights') || isWidgetEnabled('quick-stats')) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isWidgetEnabled('recent-transactions') && (
            <div className="lg:col-span-2">
              <RecentTransactions transactions={recentTransactions} />
            </div>
          )}
          
          {(isWidgetEnabled('insights') || isWidgetEnabled('quick-stats')) && (
            <div className="space-y-6">
              {isWidgetEnabled('insights') && (
                <>
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
                </>
              )}
              {isWidgetEnabled('quick-stats') && (
                <StatsCard
                  title="Quick Stats"
                  stats={[
                    { label: 'Daily Avg Income', value: stats.totalIncome / 30, isCurrency: true },
                    { label: 'Daily Avg Expense', value: stats.totalExpense / 30, isCurrency: true },
                    { label: 'Savings Rate', value: stats.savingsRate, isPercentage: true },
                    { label: 'Transactions', value: (data?.personalIncome?.length || 0) + (data?.personalExpense?.length || 0) },
                  ]}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
