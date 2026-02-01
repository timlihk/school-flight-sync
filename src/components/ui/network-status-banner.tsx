import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Check, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NetworkStatusBannerProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  dataUpdatedAt?: number;
  perSource?: Array<{ label: string; updatedAt?: number; isFetching?: boolean }>;
}

export function NetworkStatusBanner({
  onRefresh,
  isRefreshing,
  dataUpdatedAt,
  perSource = [],
}: NetworkStatusBannerProps) {
  const { isOnline, wasOffline, clearWasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Show reconnected banner briefly when coming back online
  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        clearWasOffline();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline, clearWasOffline]);

  // Offline banner
  if (!isOnline) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <WifiOff className="h-4 w-4 text-destructive" />
            <span className="text-destructive font-medium">You're offline</span>
            <span className="text-muted-foreground">- Showing cached data</span>
          </div>
        </div>
      </div>
    );
  }

  // Reconnected banner
  if (showReconnected) {
    return (
      <div className="bg-green-500/10 border-b border-green-500/20 px-4 py-2 animate-in slide-in-from-top duration-300">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-700 font-medium">Back online</span>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-7 text-xs text-green-700 hover:text-green-800 hover:bg-green-500/10"
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Online status bar with data freshness
  const hasDataInfo = dataUpdatedAt || perSource.length > 0;
  const anyFetching = perSource.some(s => s.isFetching);
  
  if (!hasDataInfo) return null;

  return (
    <div className="bg-muted/50 border-b border-border px-4 py-1.5">
      <div className="flex items-center justify-between gap-3">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Database className="h-3 w-3" />
          {anyFetching ? (
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Updating...
            </span>
          ) : dataUpdatedAt ? (
            <span>Updated {formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}</span>
          ) : (
            <span>Data loaded</span>
          )}
          {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing || anyFetching}
            className="h-6 text-xs"
          >
            <RefreshCw className={cn("h-3 w-3 mr-1", (isRefreshing || anyFetching) && "animate-spin")} />
            Refresh
          </Button>
        )}
      </div>
      
      {/* Per-source details */}
      {showDetails && perSource.length > 0 && (
        <div className="mt-2 space-y-1 border-t border-border/50 pt-2">
          {perSource.map((source) => (
            <div key={source.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{source.label}</span>
              <span className="flex items-center gap-1">
                {source.isFetching && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
                {source.updatedAt ? (
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(source.updatedAt, { addSuffix: true })}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NetworkStatusBanner;
