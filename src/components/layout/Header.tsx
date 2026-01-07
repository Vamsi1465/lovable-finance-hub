import { RefreshCw } from 'lucide-react';
import { formatTime } from '@/lib/formatters';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  lastUpdated: string | undefined;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Header = ({ lastUpdated, isRefreshing, onRefresh }: HeaderProps) => {
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
        Finance Tracker
      </h1>
      
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <span className="text-sm text-muted-foreground">
            Last Updated: {formatTime(lastUpdated)}
          </span>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </header>
  );
};
