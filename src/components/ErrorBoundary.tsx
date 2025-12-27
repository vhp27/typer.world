import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '2rem',
                    backgroundColor: 'var(--bg-color, #0a0a0a)',
                    color: 'var(--text-color, #d1d0c5)'
                }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--error-color, #ca4754)' }}>
                        Something went wrong
                    </h2>
                    <p style={{
                        color: 'var(--subtle-color, #646669)',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        maxWidth: '400px'
                    }}>
                        The application encountered an unexpected error. Please try refreshing the page.
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            background: 'var(--primary-color, #e2b714)',
                            border: 'none',
                            color: '#0a0a0a',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
