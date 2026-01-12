import { useState, useMemo } from 'react';
import { Building2, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { TrendLineChart } from '@/components/dashboard/TrendLineChart';
import { PaymentModeChart } from '@/components/dashboard/PaymentModeChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  calculateAgencyStats, 
  getCategoryBreakdown, 
  filterByDateRange 
} from '@/lib/calculations';
import { parseDate } from '@/lib/formatters';
import type { DateFilterType, DateRange } from '@/types/finance';

export const AgencyDashboard = () => {
  const { data, isLoading, error } = useFinanceData();
  const [filterType, setFilterType] = useState<DateFilterType>('daily');
  const [dateRange, setDateRange] = useState<DateRange>({ 
    from: new Date(), 
    to: new Date() 
  });

  const filteredIncome = useMemo(() => {
    return filterByDateRange(data?.agencyIncome || [], dateRange.from, dateRange.to);
  }, [data?.agencyIncome, dateRange]);

  const filteredExpense = useMemo(() => {
    return filterByDateRange(data?.agencyExpense || [], dateRange.from, dateRange.to);
  }, [data?.agencyExpense, dateRange]);

  const stats = useMemo(() => {
    return calculateAgencyStats(
      data?.agencyIncome || [], 
      data?.agencyExpense || []
    );
  }, [data]);

  const clientBreakdown = useMemo(() => {
    return getCategoryBreakdown(filteredIncome.map(i => ({ category: i.clientName, amount: i.amount })));
  }, [filteredIncome]);

  const serviceBreakdown = useMemo(() => {
    return getCategoryBreakdown(filteredIncome.map(i => ({ category: i.service, amount: i.amount })));
  }, [filteredIncome]);

  const expenseCategories = useMemo(() => {
    return getCategoryBreakdown(filteredExpense.map(e => ({ category: e.category, amount: e.amount })));
  }, [filteredExpense]);

  const trendData = useMemo(() => {
    const combined = [
      ...filteredIncome.map(i => ({ date: i.date, income: i.amount, expense: 0 })),
      ...filteredExpense.map(e => ({ date: e.date, income: 0, expense: e.amount })),
    ];

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
      const mode = i.paymentMode || 'Other';
      if (!modes[mode]) modes[mode] = { mode, income: 0, expense: 0 };
      modes[mode].income += i.amount;
    });
    
    filteredExpense.forEach(e => {
      const mode = e.paymentMode || 'Other';
      if (!modes[mode]) modes[mode] = { mode, income: 0, expense: 0 };
      modes[mode].expense += e.amount;
    });

    return Object.values(modes);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
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
      <h2 className="text-2xl font-bold">Agency Finance Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Income"
          value={stats.totalIncome}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="income"
        />
        <SummaryCard
          title="Total Expense"
          value={stats.totalExpense}
          icon={<TrendingDown className="h-5 w-5" />}
          variant="expense"
        />
        <SummaryCard
          title="Net Profit"
          value={stats.netProfit}
          icon={<Building2 className="h-5 w-5" />}
          variant={stats.netProfit >= 0 ? 'profit' : 'expense'}
        />
        <SummaryCard
          title="Recurring Revenue"
          value={stats.recurringRevenue}
          icon={<RefreshCw className="h-5 w-5" />}
          variant="default"
        />
        <SummaryCard
          title="Upcoming Payments"
          value={stats.upcomingPayments}
          icon={<AlertCircle className="h-5 w-5" />}
          variant="warning"
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
      <TrendLineChart title="Revenue vs Expenses" data={trendData} />

      {/* Income Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart title="Revenue by Client" data={clientBreakdown} />
        <CategoryPieChart title="Revenue by Service" data={serviceBreakdown} />
      </div>

      {/* Expense Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart title="Expense by Category" data={expenseCategories} />
        <PaymentModeChart data={paymentModeData} />
      </div>

      {/* Portfolio Stats */}
      <StatsCard
        title="Portfolio"
        stats={[
          { label: 'Total Transactions', value: (data?.agencyIncome?.length || 0) + (data?.agencyExpense?.length || 0) },
          { label: 'Recurring Clients', value: data?.agencyIncome?.filter(i => i.recurring).length || 0 },
        ]}
      />
    </div>
  );
};
