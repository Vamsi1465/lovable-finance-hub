import { useState, useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import { usePersonalExpense } from '@/hooks/useFinanceData';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { FilterDropdowns } from '@/components/dashboard/FilterDropdowns';
import { DataTable } from '@/components/tables/DataTable';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { Skeleton } from '@/components/ui/skeleton';
import { filterByDateRange } from '@/lib/calculations';
import { getCategoryBreakdown } from '@/lib/calculations';
import type { DateFilterType, DateRange, PersonalExpense } from '@/types/finance';

const columns = [
  { key: 'date' as keyof PersonalExpense, label: 'Date', sortable: true, format: 'date' as const },
  { key: 'name' as keyof PersonalExpense, label: 'Name', sortable: true },
  { key: 'category' as keyof PersonalExpense, label: 'Category', sortable: true },
  { key: 'amount' as keyof PersonalExpense, label: 'Amount', sortable: true, format: 'currency' as const, className: 'text-expense font-mono font-semibold' },
  { key: 'paymentMethod' as keyof PersonalExpense, label: 'Payment Method', sortable: true },
  { key: 'reason' as keyof PersonalExpense, label: 'Reason' },
];

export const PersonalExpensePage = () => {
  const { data, isLoading, error } = usePersonalExpense();
  
  // Default to monthly
  const [filterType, setFilterType] = useState<DateFilterType>('monthly');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  });
  
  // Category and Payment Method filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All');

  const allCategories = useMemo(() => {
    return data?.map(e => e.category) || [];
  }, [data]);

  const allPaymentMethods = useMemo(() => {
    return data?.map(e => e.paymentMethod) || [];
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = filterByDateRange(data, dateRange.from, dateRange.to);
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }
    if (selectedPaymentMethod !== 'All') {
      filtered = filtered.filter(e => e.paymentMethod === selectedPaymentMethod);
    }
    return filtered;
  }, [data, dateRange, selectedCategory, selectedPaymentMethod]);

  const totalExpense = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredData]);

  const categories = useMemo(() => {
    return getCategoryBreakdown(filteredData.map(e => ({ category: e.category, amount: e.amount })));
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
        <Skeleton className="h-32 w-64 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Personal Expenses</h2>

      {/* Summary */}
      <div className="max-w-sm">
        <SummaryCard
          title="Total Expense"
          value={totalExpense}
          icon={<TrendingDown className="h-5 w-5" />}
          variant="expense"
        />
      </div>

      {/* Date Filter */}
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

      {/* Data Table */}
      <DataTable
        title="Expense Transactions"
        data={filteredData}
        columns={columns}
        searchKey="name"
      />

      {/* Category Chart */}
      <div className="max-w-lg">
        <CategoryPieChart title="Expense by Category" data={categories} />
      </div>
    </div>
  );
};
