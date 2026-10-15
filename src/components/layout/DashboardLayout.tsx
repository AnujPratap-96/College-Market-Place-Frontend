import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const CampusAIAssistant = lazy(() =>
  import("@/modules/assistant/components/CampusAIAssistant").then((m) => ({
    default: m.CampusAIAssistant,
  }))
);

const DashboardLayout = () => {
  usePushNotifications();
  const mainRef = useRef<HTMLElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const handleScroll = () => {
      setShowScrollTop(mainEl.scrollTop > 350);
    };

    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background relative selection:bg-orange-500/20 selection:text-orange-600">
      {/* Ambient background glows for the authenticated dashboard */}
      <div className="fixed top-12 right-1/4 w-96 h-96 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-12 left-1/3 w-[30rem] h-[30rem] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <Header />
      <div className="flex flex-1 overflow-hidden pt-16 md:pl-64 relative z-10">
        <Sidebar />
        <main ref={mainRef} className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto scroll-smooth p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-16">
            <ErrorBoundary
              fallbackTitle="Section Temporarily Unavailable"
              fallbackSubtitle="This dashboard section encountered an unexpected error. You can retry or navigate to another campus feature using the sidebar."
            >
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={handleScrollTop}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-20 right-6 z-40 p-2.5 rounded-full bg-card/90 backdrop-blur-md border border-border/80 text-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 shadow-lg shadow-black/5 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
        >
          <ArrowUp className="w-5 h-5 text-orange-500" />
        </button>
      )}

      <Suspense fallback={null}>
        <CampusAIAssistant />
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
