import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || "Unknown render error",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AppErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">The app hit a render error</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              I added this fallback so the page will no longer appear blank.
            </p>
            <pre className="mt-4 overflow-auto rounded-lg bg-muted p-4 text-xs text-muted-foreground whitespace-pre-wrap">
              {this.state.message}
            </pre>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
