import { useState, useMemo } from 'react';
import { Receipt, RefreshCw, Building } from 'lucide-react';
import { useAgencyExpense } from '@/hooks/useFinanceData';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { DataTable } from '@/components/tables/DataTable';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { Skeleton } from '@/components/ui/skeleton';
import { filterByDateRange, getCategoryBreakdown } from '@/lib/calculations';
import type { DateFilterType, DateRange, AgencyExpense } from '@/types/finance';

const columns = [
  { key: 'date' as keyof AgencyExpense, label: 'Date', sortable: true, format: 'date' as const },
  { key: 'category' as keyof AgencyExpense, label: 'Category', sortable: true },
  { key: 'paidTo' as keyof AgencyExpense, label: 'Paid To', sortable: true },
  { key: 'amount' as keyof AgencyExpense, label: 'Amount', sortable: true, format: 'currency' as const, className: 'text-expense font-mono font-semibold' },
  { key: 'recurring' as keyof AgencyExpense, label: 'Recurring', sortable: true },
  { key: 'paymentMode' as keyof AgencyExpense, label: 'Payment Mode', sortable: true },
  { key: 'nextPaymentDate' as keyof AgencyExpense, label: 'Next Payment', format: 'date' as const },
];

export const AgencyExpensePage = () => {
  const { data, isLoading, error } = useAgencyExpense();
  const [filterType, setFilterType] = useState<DateFilterType>('daily');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  const filteredData = useMemo(() => {
    return filterByDateRange(data, dateRange.from, dateRange.to);
  }, [data, dateRange]);

  const totalExpense = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredData]);

  const recurringExpense = useMemo(() => {
    return filteredData.filter(e => e.recurring).reduce((sum, item) => sum + item.amount, 0);
  }, [filteredData]);

  const uniqueVendors = useMemo(() => {
    return new Set(filteredData.map(e => e.paidTo)).size;
  }, [filteredData]);

  const categoryBreakdown = useMemo(() => {
    return getCategoryBreakdown(filteredData.map(e => ({ category: e.category, amount: e.amount })));
  }, [filteredData]);

  // Transform data for table display
  const tableData = useMemo(() => {
    return filteredData.map(item => ({
      ...item,
      recurring: item.recurring ? 'Yes' : 'No',
    }));
  }, [filteredData]);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Agency Expenses</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Expense"
          value={totalExpense}
          icon={<Receipt className="h-5 w-5" />}
          variant="expense"
        />
        <SummaryCard
          title="Recurring Expense"
          value={recurringExpense}
          icon={<RefreshCw className="h-5 w-5" />}
          variant="warning"
        />
        <SummaryCard
          title="Total Vendors"
          value={uniqueVendors}
          icon={<Building className="h-5 w-5" />}
          variant="default"
          isCurrency={false}
        />
      </div>

      {/* Date Filter */}
      <DateFilter
        filterType={filterType}
        dateRange={dateRange}
        onFilterTypeChange={setFilterType}
        onDateRangeChange={setDateRange}
      />

      {/* Data Table */}
      <DataTable
        title="Agency Expense Transactions"
        data={tableData}
        columns={columns}
        searchKey="paidTo"
      />

      {/* Category Chart */}
      <div className="max-w-lg">
        <CategoryPieChart title="Expense by Category" data={categoryBreakdown} />
      </div>
    </div>
  );
};
