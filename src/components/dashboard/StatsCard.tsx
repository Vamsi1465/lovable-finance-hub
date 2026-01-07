import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

interface StatItem {
  label: string;
  value: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

interface StatsCardProps {
  title: string;
  stats: StatItem[];
}

export const StatsCard = ({ title, stats }: StatsCardProps) => {
  const formatValue = (stat: StatItem) => {
    if (stat.isPercentage) {
      return formatPercentage(stat.value);
    }
    if (stat.isCurrency) {
      return formatCurrency(stat.value);
    }
    return stat.value.toLocaleString();
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold font-mono">{formatValue(stat)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
