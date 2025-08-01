import React from 'react';

// Production debugging component
export const ProductionDebugger = () => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.log('Production Debug Info:', {
        reactVersion: React.version,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        localStorage: {
          hasToken: !!localStorage.getItem('thinktact_token'),
          hasUser: !!localStorage.getItem('thinktact_user'),
        },
        sessionStorage: {
          keys: Object.keys(sessionStorage),
        },
        window: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
        }
      });
    }
  }, []);

  return null;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log additional production debugging info
    console.error('Production Debug Info:', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      reactVersion: React.version
    });
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl font-bold mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Go to Home
              </button>
            </div>
            {(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details ({process.env.NODE_ENV})
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto">
                  <div className="text-red-600 font-bold">Error:</div>
                  <div className="text-gray-800">{this.state.error.toString()}</div>
                  {this.state.errorInfo && (
                    <>
                      <div className="text-red-600 font-bold mt-2">Stack Trace:</div>
                      <div className="text-gray-800">{this.state.errorInfo.componentStack}</div>
                    </>
                  )}
                  <div className="text-red-600 font-bold mt-2">Environment:</div>
                  <div className="text-gray-800">
                    NODE_ENV: {process.env.NODE_ENV}<br/>
                    React Version: {React.version}<br/>
                    URL: {window.location.href}<br/>
                    User Agent: {navigator.userAgent}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary for PatentAudit component
export class PatentAuditErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PatentAudit ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Patent Application Error</h1>
            <p className="text-gray-600 mb-4">There was an error loading the patent application wizard.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 