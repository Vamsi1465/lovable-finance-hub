import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { PersonalDashboard } from "@/pages/PersonalDashboard";
import { PersonalIncomePage } from "@/pages/PersonalIncome";
import { PersonalExpensePage } from "@/pages/PersonalExpense";
import { AgencyDashboard } from "@/pages/AgencyDashboard";
import { AgencyIncomePage } from "@/pages/AgencyIncome";
import { AgencyExpensePage } from "@/pages/AgencyExpense";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<PersonalDashboard />} />
            <Route path="/personal/income" element={<PersonalIncomePage />} />
            <Route path="/personal/expense" element={<PersonalExpensePage />} />
            <Route path="/agency" element={<AgencyDashboard />} />
            <Route path="/agency/income" element={<AgencyIncomePage />} />
            <Route path="/agency/expense" element={<AgencyExpensePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
