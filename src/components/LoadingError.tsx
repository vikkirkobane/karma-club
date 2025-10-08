import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface LoadingErrorProps {
  error?: string | Error;
  onRetry?: () => void;
  isOffline?: boolean;
  className?: string;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({
  error,
  onRetry,
  isOffline = false,
  className = ""
}) => {
  const getErrorMessage = () => {
    if (isOffline) {
      return "You're currently offline. Please check your internet connection.";
    }
    
    if (error) {
      const message = typeof error === 'string' ? error : error.message;
      
      if (message.includes('network') || message.includes('fetch')) {
        return "Connection problem. Please check your internet and try again.";
      }
      
      if (message.includes('timeout')) {
        return "The request took too long. Please try again.";
      }
      
      return message;
    }
    
    return "Something went wrong. Please try again.";
  };

  const getErrorIcon = () => {
    if (isOffline) {
      return <WifiOff className="h-8 w-8 text-red-400" />;
    }
    return <AlertCircle className="h-8 w-8 text-red-400" />;
  };

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          {getErrorIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">
          {isOffline ? "No Internet Connection" : "Error Loading Content"}
        </h3>
        
        <p className="text-gray-400 mb-4">
          {getErrorMessage()}
        </p>
        
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};