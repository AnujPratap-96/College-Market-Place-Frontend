import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ChevronDown } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    this.props.onReset?.();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 my-auto">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl p-6 sm:p-8 shadow-xl text-center">
            {/* Warning Icon with Glow */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-inner mb-5">
              <AlertTriangle className="w-7 h-7 text-orange-500 animate-pulse" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {this.props.fallbackTitle || "Something went wrong"}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {this.props.fallbackSubtitle ||
                "An unexpected rendering error occurred. We've protected your session data."}
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs sm:text-sm border border-border/70 transition-all cursor-pointer active:scale-95"
              >
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-xs sm:text-sm border border-border/50 transition-all cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>

            {/* Expandable Technical Details (Useful for debugging) */}
            {this.state.error && (
              <div className="mt-6 pt-5 border-t border-border/60 text-left">
                <button
                  type="button"
                  onClick={() =>
                    this.setState((prev) => ({ showDetails: !prev.showDetails }))
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      this.state.showDetails ? "rotate-180" : ""
                    }`}
                  />
                  <span>
                    {this.state.showDetails ? "Hide" : "Show"} Technical Details
                  </span>
                </button>

                {this.state.showDetails && (
                  <div className="mt-3 p-3 rounded-lg bg-black/40 text-red-400 font-mono text-[11px] overflow-x-auto border border-red-500/20 max-h-48 scrollbar-thin">
                    <p className="font-semibold">{this.state.error.toString()}</p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="mt-2 text-muted-foreground text-[10px] whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
