import React from 'react';

interface WebGLErrorBoundaryProps {
  children: React.ReactNode;
  fallback: (options: { error: Error | null; onRetry: () => void }) => React.ReactNode;
  onError?: (error: Error) => void;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary around the 3D WebGL experience so any WebGL initialization
 * or shader/context error renders the curated non-3D fallback instead of a blank screen.
 */
export class WebGLErrorBoundary extends React.Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): WebGLErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    this.props.onError?.(error);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback({
        error: this.state.error,
        onRetry: this.handleRetry,
      });
    }
    return this.props.children;
  }
}
