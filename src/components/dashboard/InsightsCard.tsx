import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CategoryBreakdown } from '@/types/finance';

interface InsightsCardProps {
  title: string;
  categories: CategoryBreakdown[];
  variant?: 'income' | 'expense';
  maxItems?: number;
}

export const InsightsCard = ({ 
  title, 
  categories, 
  variant = 'expense',
  maxItems = 3 
}: InsightsCardProps) => {
  const topCategories = categories.slice(0, maxItems);
  const maxAmount = topCategories[0]?.amount || 1;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCategories.length === 0 ? (
          <p className="text-muted-foreground text-sm">No data available</p>
        ) : (
          topCategories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{category.category}</span>
                <span className="font-mono text-muted-foreground">
                  {formatCurrency(category.amount)}
                </span>
              </div>
              <Progress 
                value={(category.amount / maxAmount) * 100}
                className={cn(
                  "h-2",
                  variant === 'income' 
                    ? "[&>div]:bg-income" 
                    : "[&>div]:bg-expense"
                )}
              />
              <span className="text-xs text-muted-foreground">
                {category.percentage.toFixed(1)}% of total
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
