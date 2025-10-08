import React from 'react';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  onRetry?: () => void;
  showSyncStatus?: boolean;
}

export function OfflineIndicator({ onRetry, showSyncStatus }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showSyncStatus) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        px-4 py-2 rounded-lg shadow-lg flex items-center gap-2
        ${isOnline ? 'bg-yellow-900 text-yellow-100' : 'bg-red-900 text-red-100'}
      `}>
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm">Syncing...</span>
            {onRetry && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRetry}
                className="h-6 px-2"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">You're offline</span>
            {onRetry && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRetry}
                className="h-6 px-2"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}