import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export const useErrorHandler = () => {
  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    // Show user-friendly toast
    toast({
      title: "Error",
      description: getErrorMessage(errorMessage),
      variant: "destructive",
    });
  }, []);

  const handleSuccess = useCallback((message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  }, []);

  return { handleError, handleSuccess };
};

// Utility function to get user-friendly error messages
const getErrorMessage = (errorMessage: string): string => {
  const message = errorMessage.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return "Connection problem. Please check your internet and try again.";
  }
  
  if (message.includes('unauthorized') || message.includes('401')) {
    return "You need to log in to access this feature.";
  }
  
  if (message.includes('forbidden') || message.includes('403')) {
    return "You don't have permission to perform this action.";
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return "The requested content could not be found.";
  }
  
  if (message.includes('timeout')) {
    return "The request took too long. Please try again.";
  }
  
  if (message.includes('storage') || message.includes('quota')) {
    return "Storage limit reached. Please free up some space.";
  }
  
  // Default user-friendly message
  return "Something went wrong. Please try again or contact support if the problem persists.";
};