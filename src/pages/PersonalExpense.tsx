import { useState, useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { usePersonalExpense } from '@/hooks/useFinanceData';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { DataTable } from '@/components/tables/DataTable';
import { TransactionEditDialog } from '@/components/tables/TransactionEditDialog';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { Skeleton } from '@/components/ui/skeleton';
import { filterByDateRange } from '@/lib/calculations';
import { getCategoryBreakdown } from '@/lib/calculations';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<DateFilterType>('monthly');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PersonalExpense | null>(null);
  const [editMode, setEditMode] = useState<'edit' | 'add'>('edit');

  const filteredData = useMemo(() => {
    return filterByDateRange(data, dateRange.from, dateRange.to);
  }, [data, dateRange]);

  const totalExpense = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredData]);

  const categories = useMemo(() => {
    return getCategoryBreakdown(filteredData.map(e => ({ category: e.category, amount: e.amount })));
  }, [filteredData]);

  const handleEdit = (item: PersonalExpense, index: number) => {
    setSelectedTransaction(item);
    setEditMode('edit');
    setEditDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedTransaction(null);
    setEditMode('add');
    setEditDialogOpen(true);
  };

  const handleSave = (updatedData: Record<string, any>) => {
    toast({
      title: editMode === 'edit' ? 'Transaction Updated' : 'Transaction Added',
      description: 'Changes saved locally. To persist changes, update your Google Sheet directly.',
    });
  };

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
      <DateFilter
        filterType={filterType}
        dateRange={dateRange}
        onFilterTypeChange={setFilterType}
        onDateRangeChange={setDateRange}
      />

      {/* Data Table */}
      <DataTable
        title="Expense Transactions"
        data={filteredData}
        columns={columns}
        searchKey="name"
        onEdit={handleEdit}
        onAdd={handleAdd}
      />

      {/* Category Chart */}
      <div className="max-w-lg">
        <CategoryPieChart title="Expense by Category" data={categories} />
      </div>

      {/* Edit Dialog */}
      <TransactionEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        transaction={selectedTransaction}
        transactionType="personalExpense"
        onSave={handleSave}
        mode={editMode}
      />
    </div>
  );
};
