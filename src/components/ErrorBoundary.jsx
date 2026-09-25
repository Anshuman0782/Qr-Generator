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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('qrcadia_state');
    } catch {
      // Ignore
    }
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: '#0a0b10',
          color: '#f3f4f6',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2.5rem',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#00f2fe' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              A temporary issue occurred while rendering. Click below to safely reset and reload.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                color: '#0a0b10',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Reset & Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
