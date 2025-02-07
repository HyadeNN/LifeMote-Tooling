import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        
                        <h1 className="text-xl font-semibold text-center mb-4">
                            Something went wrong
                        </h1>
                        
                        <div className="bg-gray-50 rounded p-4 mb-4">
                            <p className="text-sm text-gray-600 break-words">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <div className="mt-4">
                                <details className="cursor-pointer">
                                    <summary className="text-sm text-gray-600 mb-2">
                                        Error Details (Development Only)
                                    </summary>
                                    <pre className="text-xs bg-gray-900 text-white p-4 rounded overflow-auto">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;