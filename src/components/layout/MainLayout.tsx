import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useQueryClient } from '@tanstack/react-query';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { data, isFetching } = useFinanceData();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['financeData'] });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center border-b border-border bg-card/50 backdrop-blur-sm">
            <SidebarTrigger className="ml-2" />
            <div className="flex-1">
              <Header 
                lastUpdated={data?.lastUpdated} 
                isRefreshing={isFetching}
                onRefresh={handleRefresh}
              />
            </div>
          </div>
          
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
