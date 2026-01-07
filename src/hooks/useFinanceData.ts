import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SheetsData } from '@/types/finance';

const fetchFinanceData = async (): Promise<SheetsData> => {
  console.log('Fetching finance data from edge function...');
  
  const { data, error } = await supabase.functions.invoke('fetch-sheets');
  
  if (error) {
    console.error('Error fetching finance data:', error);
    throw new Error(error.message || 'Failed to fetch finance data');
  }
  
  if (data.error) {
    console.error('API error:', data.error);
    throw new Error(data.error);
  }
  
  console.log('Finance data fetched successfully');
  return data as SheetsData;
};

export const useFinanceData = () => {
  return useQuery({
    queryKey: ['financeData'],
    queryFn: fetchFinanceData,
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const usePersonalIncome = () => {
  const { data, ...rest } = useFinanceData();
  return {
    data: data?.personalIncome || [],
    ...rest,
  };
};

export const usePersonalExpense = () => {
  const { data, ...rest } = useFinanceData();
  return {
    data: data?.personalExpense || [],
    ...rest,
  };
};

export const useAgencyIncome = () => {
  const { data, ...rest } = useFinanceData();
  return {
    data: data?.agencyIncome || [],
    ...rest,
  };
};

export const useAgencyExpense = () => {
  const { data, ...rest } = useFinanceData();
  return {
    data: data?.agencyExpense || [],
    ...rest,
  };
};
