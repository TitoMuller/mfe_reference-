import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI instead of crashing the entire application.
 * Essential for production reliability in micro frontend environments.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Log to error tracking service (e.g., Sentry, LogRocket, etc.)
      this.logErrorToService(error, errorInfo);
    }
  }

  /**
   * Log error to external service in production
   */
  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Implementation depends on your error tracking service
    console.log('Would log error to service:', { error, errorInfo });
  }

  /**
   * Handle retry button click
   */
  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
          <Card className="bg-gray-900 border-gray-800 max-w-2xl w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/20 rounded-full mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-100 mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-400">
                  The DORA Metrics dashboard encountered an unexpected error. 
                  Please try refreshing the page or contact support if the problem persists.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Refresh Page
                </Button>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                    Show Error Details
                  </summary>
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <h3 className="text-sm font-medium text-red-400 mb-2">
                      Error Message:
                    </h3>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap mb-4">
                      {this.state.error.toString()}
                    </pre>
                    
                    {this.state.errorInfo && (
                      <>
                        <h3 className="text-sm font-medium text-red-400 mb-2">
                          Component Stack:
                        </h3>
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}

              {/* Support Information */}
              <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-300 mb-2">
                  Need Help?
                </h3>
                <p className="text-xs text-gray-400">
                  If this error persists, please contact your system administrator 
                  or check the Zephyr documentation for troubleshooting steps.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}