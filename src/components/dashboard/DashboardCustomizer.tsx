import { useState } from 'react';
import { Settings, X, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export interface DashboardWidget {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

interface DashboardCustomizerProps {
  widgets: DashboardWidget[];
  onWidgetsChange: (widgets: DashboardWidget[]) => void;
}

export const DashboardCustomizer = ({
  widgets,
  onWidgetsChange,
}: DashboardCustomizerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = (id: string) => {
    const updated = widgets.map((widget) =>
      widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
    );
    onWidgetsChange(updated);
  };

  const enabledCount = widgets.filter((w) => w.enabled).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Customize
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-background">
        <SheetHeader>
          <SheetTitle>Customize Dashboard</SheetTitle>
          <SheetDescription>
            Toggle widgets on/off to personalize your dashboard view.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Active Widgets</span>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {enabledCount} / {widgets.length}
            </span>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            {widgets
              .sort((a, b) => a.order - b.order)
              .map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Label htmlFor={widget.id} className="font-medium cursor-pointer">
                      {widget.name}
                    </Label>
                  </div>
                  <Switch
                    id={widget.id}
                    checked={widget.enabled}
                    onCheckedChange={() => toggleWidget(widget.id)}
                  />
                </div>
              ))}
          </div>
          
          <Separator />
          
          <div className="text-xs text-muted-foreground">
            <p>💡 Tip: Disable widgets you don't need to keep your dashboard clean and focused.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Default widgets configuration
export const getDefaultPersonalWidgets = (): DashboardWidget[] => [
  { id: 'summary-cards', name: 'Summary Cards', enabled: true, order: 1 },
  { id: 'date-filter', name: 'Date Filter', enabled: true, order: 2 },
  { id: 'trend-chart', name: 'Income vs Expense Trend', enabled: true, order: 3 },
  { id: 'income-categories', name: 'Income by Category', enabled: true, order: 4 },
  { id: 'expense-categories', name: 'Expense by Category', enabled: true, order: 5 },
  { id: 'payment-modes', name: 'Payment Mode Analysis', enabled: true, order: 6 },
  { id: 'recent-transactions', name: 'Recent Transactions', enabled: true, order: 7 },
  { id: 'insights', name: 'Insights Cards', enabled: true, order: 8 },
  { id: 'quick-stats', name: 'Quick Stats', enabled: true, order: 9 },
];

export const getDefaultAgencyWidgets = (): DashboardWidget[] => [
  { id: 'summary-cards', name: 'Summary Cards', enabled: true, order: 1 },
  { id: 'date-filter', name: 'Date Filter', enabled: true, order: 2 },
  { id: 'trend-chart', name: 'Revenue vs Expenses Trend', enabled: true, order: 3 },
  { id: 'client-breakdown', name: 'Revenue by Client', enabled: true, order: 4 },
  { id: 'service-breakdown', name: 'Revenue by Service', enabled: true, order: 5 },
  { id: 'expense-categories', name: 'Expense by Category', enabled: true, order: 6 },
  { id: 'payment-modes', name: 'Payment Mode Analysis', enabled: true, order: 7 },
  { id: 'portfolio-stats', name: 'Portfolio Stats', enabled: true, order: 8 },
];
