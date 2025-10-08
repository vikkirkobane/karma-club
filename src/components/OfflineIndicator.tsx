// TEMPORARILY DISABLED - USING OfflineIndicator-simple.tsx instead
// This file has been temporarily disabled due to framer-motion dependency issues
// The app is using OfflineIndicator-simple.tsx instead

export const OfflineIndicator = () => null;
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface OfflineIndicatorProps {
  onRetry?: () => Promise<void> | void;
  showSyncStatus?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  onRetry,
  showSyncStatus = true
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { handleError } = useErrorHandler();

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back online",
        description: "Your connection has been restored.",
        className: "bg-green-600 text-white border-0",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Some features may be limited.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline) return;

    try {
      setIsSyncing(true);
      await onRetry?.();
      setLastSync(new Date());
      toast({
        title: "Sync complete",
        description: "Your data is up to date.",
      });
    } catch (error) {
      handleError(error as Error, 'syncing data');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>Online</span>
            {showSyncStatus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="h-6 px-2 text-xs text-white hover:bg-green-700"
              >
                {isSyncing ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                <span className="ml-1">Sync</span>
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-4 right-4 z-50"
      >
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
          {lastSync && (
            <span className="text-xs opacity-80">
              Last synced: {lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};