import { Outlet } from "react-router-dom";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { CampusAIAssistant } from "@/modules/assistant/components/CampusAIAssistant";

const DashboardLayout = () => {
  usePushNotifications();
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background relative selection:bg-orange-500/20 selection:text-orange-600">
      {/* Ambient background glows for the authenticated dashboard */}
      <div className="fixed top-12 right-1/4 w-96 h-96 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-12 left-1/3 w-[30rem] h-[30rem] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <Header />
      <div className="flex flex-1 overflow-hidden pt-16 md:pl-64 relative z-10">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto scroll-smooth p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-16">
            <Outlet />
          </div>
        </main>
      </div>
      <CampusAIAssistant />
    </div>
  );
};

export default DashboardLayout;
