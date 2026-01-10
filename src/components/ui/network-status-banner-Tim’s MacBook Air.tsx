import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const [isStale, setIsStale] = useState(false);

  // Check if data is stale (more than 5 minutes old)
  useEffect(() => {
    if (!dataUpdatedAt) {
      setIsStale(false);
      return;
    }

    const checkStale = () => {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      setIsStale(now - dataUpdatedAt > fiveMinutes);
    };

    checkStale();
    const interval = setInterval(checkStale, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

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

  // Stale data banner
  if (isStale && !isRefreshing) {
    const minutesAgo = dataUpdatedAt
      ? Math.round((Date.now() - dataUpdatedAt) / 60000)
      : null;
    const detail = perSource
      .filter(p => p.updatedAt)
      .map(p => `${p.label} ${Math.round((Date.now() - (p.updatedAt || 0)) / 60000)}m ago`)
      .join(' · ');

    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-700 font-medium">Data may be outdated</span>
            {minutesAgo !== null && (
              <span className="text-muted-foreground">
                - Last updated {minutesAgo} min ago
              </span>
            )}
            {detail && (
              <span className="text-muted-foreground">
                ({detail})
              </span>
            )}
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-7 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-500/10"
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default NetworkStatusBanner;
