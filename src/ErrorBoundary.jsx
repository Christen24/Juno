import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        // You can also log the error to an error reporting service
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, background: '#330000', color: 'red', height: '100%', overflow: 'auto' }}>
                    <h1>UI Crash</h1>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}
