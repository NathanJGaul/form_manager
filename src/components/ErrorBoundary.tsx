import React, { Component, ReactNode, ErrorInfo } from 'react';
import * as Icons from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo, 
  resetError 
}) => (
  <div className="min-h-[200px] flex items-center justify-center bg-red-50 border border-red-200 rounded-lg p-6">
    <div className="text-center max-w-md">
      <Icons.AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-red-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-red-600 text-sm mb-4">
        An unexpected error occurred while rendering this component.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <details className="text-left bg-red-100 border border-red-300 rounded p-3 mb-4">
          <summary className="cursor-pointer text-red-800 font-medium">
            Error Details
          </summary>
          <div className="mt-2 text-xs text-red-700 font-mono">
            <div className="mb-2">
              <strong>Error:</strong> {error.message}
            </div>
            {error.stack && (
              <div className="mb-2">
                <strong>Stack:</strong>
                <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
              </div>
            )}
            {errorInfo?.componentStack && (
              <div>
                <strong>Component Stack:</strong>
                <pre className="whitespace-pre-wrap text-xs">{errorInfo.componentStack}</pre>
              </div>
            )}
          </div>
        </details>
      )}
      <button
        onClick={resetError}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
      >
        <Icons.RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  </div>
);

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys change
    if (
      hasError &&
      resetKeys &&
      prevProps.resetKeys &&
      resetKeys.some((resetKey, idx) => resetKey !== prevProps.resetKeys![idx])
    ) {
      this.resetError();
    }

    // Reset error state if props change (when resetOnPropsChange is true)
    if (
      hasError &&
      resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.resetError();
    }
  }

  resetError = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
      });
    }, 100);
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: Fallback = DefaultErrorFallback } = this.props;

    if (hasError && error) {
      return (
        <Fallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return children;
  }
}

interface FormErrorBoundaryProps {
  children: ReactNode;
  formName?: string;
}

export const FormErrorBoundary: React.FC<FormErrorBoundaryProps> = ({ 
  children, 
  formName = 'form' 
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error(`Error in ${formName}:`, error, errorInfo);
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={({ error, resetError }) => (
        <div className="min-h-[300px] flex items-center justify-center bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="text-center max-w-lg">
            <Icons.AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-red-800 mb-3">
              Form Error
            </h2>
            <p className="text-red-600 mb-6">
              An error occurred while rendering the {formName}. Your data has been preserved.
            </p>
            <div className="space-y-3">
              <button
                onClick={resetError}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icons.RefreshCw className="w-5 h-5" />
                <span>Retry Rendering</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icons.RotateCcw className="w-5 h-5" />
                <span>Reload Page</span>
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left bg-red-100 border border-red-300 rounded p-4">
                <summary className="cursor-pointer text-red-800 font-medium">
                  Error Details
                </summary>
                <div className="mt-3 text-sm text-red-700 font-mono">
                  <div>
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div className="mt-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">{error.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

interface TemplateErrorBoundaryProps {
  children: ReactNode;
  templateName?: string;
}

export const TemplateErrorBoundary: React.FC<TemplateErrorBoundaryProps> = ({ 
  children, 
  templateName = 'template' 
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error(`Error in template ${templateName}:`, error, errorInfo);
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={({ error, resetError }) => (
        <div className="min-h-[200px] flex items-center justify-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center max-w-md">
            <Icons.FileX className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Template Error
            </h3>
            <p className="text-yellow-700 text-sm mb-4">
              Failed to render template "{templateName}". The template may contain invalid configuration.
            </p>
            <div className="space-y-2">
              <button
                onClick={resetError}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icons.RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left bg-yellow-100 border border-yellow-300 rounded p-3">
                <summary className="cursor-pointer text-yellow-800 font-medium text-sm">
                  Technical Details
                </summary>
                <div className="mt-2 text-xs text-yellow-700 font-mono">
                  {error.message}
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};