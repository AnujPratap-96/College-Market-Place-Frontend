import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { AlertCircle, FileQuestion, ArrowLeft, RotateCcw } from "lucide-react";

export const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const statusText = isRouteErrorResponse(error)
    ? error.statusText
    : (error as Error)?.message || "Internal Application Error";

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-8 text-center shadow-2xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-6 shadow-inner">
          {is404 ? (
            <FileQuestion className="w-8 h-8 text-orange-500" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />
          )}
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-3 border border-orange-500/20">
          {is404 ? "404 Not Found" : `Error ${status}`}
        </span>

        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {is404 ? "Page Not Found" : "Something Went Wrong"}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {is404
            ? "The page or campus resource you're looking for doesn't exist or has moved."
            : statusText}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs sm:text-sm border border-border/70 transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Campus Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
