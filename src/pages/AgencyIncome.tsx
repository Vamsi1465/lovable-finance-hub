import { useState, useMemo } from 'react';
import { DollarSign, RefreshCw, Users } from 'lucide-react';
import { useAgencyIncome } from '@/hooks/useFinanceData';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { DataTable } from '@/components/tables/DataTable';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { Skeleton } from '@/components/ui/skeleton';
import { filterByDateRange, getCategoryBreakdown } from '@/lib/calculations';
import type { DateFilterType, DateRange, AgencyIncome } from '@/types/finance';

const columns = [
  { key: 'date' as keyof AgencyIncome, label: 'Date', sortable: true, format: 'date' as const },
  { key: 'clientName' as keyof AgencyIncome, label: 'Client', sortable: true },
  { key: 'service' as keyof AgencyIncome, label: 'Service', sortable: true },
  { key: 'amount' as keyof AgencyIncome, label: 'Amount', sortable: true, format: 'currency' as const, className: 'text-income font-mono font-semibold' },
  { key: 'recurring' as keyof AgencyIncome, label: 'Recurring', sortable: true },
  { key: 'paymentMode' as keyof AgencyIncome, label: 'Payment Mode', sortable: true },
  { key: 'nextPaymentDate' as keyof AgencyIncome, label: 'Next Payment', format: 'date' as const },
];

export const AgencyIncomePage = () => {
  const { data, isLoading, error } = useAgencyIncome();
  const [filterType, setFilterType] = useState<DateFilterType>('daily');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  const filteredData = useMemo(() => {
    return filterByDateRange(data, dateRange.from, dateRange.to);
  }, [data, dateRange]);

  const totalIncome = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredData]);

  const recurringIncome = useMemo(() => {
    return filteredData.filter(i => i.recurring).reduce((sum, item) => sum + item.amount, 0);
  }, [filteredData]);

  const uniqueClients = useMemo(() => {
    return new Set(filteredData.map(i => i.clientName)).size;
  }, [filteredData]);

  const serviceBreakdown = useMemo(() => {
    return getCategoryBreakdown(filteredData.map(i => ({ category: i.service, amount: i.amount })));
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
      <h2 className="text-2xl font-bold">Agency Income</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Income"
          value={totalIncome}
          icon={<DollarSign className="h-5 w-5" />}
          variant="income"
        />
        <SummaryCard
          title="Recurring Income"
          value={recurringIncome}
          icon={<RefreshCw className="h-5 w-5" />}
          variant="default"
        />
        <SummaryCard
          title="Total Clients"
          value={uniqueClients}
          icon={<Users className="h-5 w-5" />}
          variant="profit"
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
        title="Agency Income Transactions"
        data={tableData}
        columns={columns}
        searchKey="clientName"
      />

      {/* Service Chart */}
      <div className="max-w-lg">
        <CategoryPieChart title="Revenue by Service" data={serviceBreakdown} />
      </div>
    </div>
  );
};
