import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      retryCount: 0 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
    
    // Show toast notification for non-critical errors
    if (!this.isCriticalError(error)) {
      toast({
        title: "Something went wrong",
        description: "An error occurred, but we're working on it!",
        variant: "destructive",
      });
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, you would send this to services like Sentry, LogRocket, etc.
    console.log('Error logged to service:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  private isCriticalError = (error: Error): boolean => {
    // Define critical errors that should show the full error UI
    const criticalPatterns = [
      'ChunkLoadError',
      'Network Error',
      'Loading chunk',
      'Cannot read properties of undefined',
    ];
    
    return criticalPatterns.some(pattern => 
      error.message.includes(pattern) || 
      error.name.includes(pattern)
    );
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      const isCritical = error ? this.isCriticalError(error) : false;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl text-white">
                {isCritical ? "Critical Error" : "Something went wrong"}
              </CardTitle>
              <p className="text-gray-400 mt-2">
                {isCritical 
                  ? "A serious error occurred that requires attention."
                  : "Don't worry, this happens sometimes. Let's get you back on track."
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && error && (
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Error Details (Dev Mode)</span>
                  </div>
                  <p className="text-sm text-gray-300 font-mono">
                    {error.message}
                  </p>
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-gray-400 mt-2 overflow-x-auto">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-400">
                <p>If this problem persists, please contact support with the error details above.</p>
                <p className="mt-1">Error ID: {Date.now().toString(36)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Default export for backward compatibility
export default ErrorBoundary;