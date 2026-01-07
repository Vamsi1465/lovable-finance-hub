import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: number;
  growth?: number;
  icon: ReactNode;
  variant?: 'default' | 'income' | 'expense' | 'profit' | 'warning';
  isCurrency?: boolean;
}

export const SummaryCard = ({ 
  title, 
  value, 
  growth, 
  icon,
  variant = 'default',
  isCurrency = true
}: SummaryCardProps) => {
  const gradientClasses = {
    default: 'from-primary/20 to-primary/5',
    income: 'from-income/20 to-income/5',
    expense: 'from-expense/20 to-expense/5',
    profit: 'from-profit/20 to-profit/5',
    warning: 'from-warning/20 to-warning/5',
  };

  const iconBgClasses = {
    default: 'bg-primary/20 text-primary',
    income: 'bg-income/20 text-income',
    expense: 'bg-expense/20 text-expense',
    profit: 'bg-profit/20 text-profit',
    warning: 'bg-warning/20 text-warning',
  };

  return (
    <Card className={cn(
      "glass-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
      `bg-gradient-to-br ${gradientClasses[variant]}`
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold font-mono tracking-tight">
              {isCurrency ? formatCurrency(value) : value.toLocaleString()}
            </p>
            {typeof growth === 'number' && (
              <p className={cn(
                "text-xs font-medium",
                growth >= 0 ? "text-income" : "text-expense"
              )}>
                {formatPercentage(growth)} from last month
              </p>
            )}
          </div>
          
          <div className={cn(
            "p-3 rounded-xl",
            iconBgClasses[variant]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
