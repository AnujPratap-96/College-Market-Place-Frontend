import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { CampusAIAssistant } from "@/modules/assistant/components/CampusAIAssistant";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16 md:pl-64">
        <Sidebar />
        <main className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6">
          <div className="max-w-7xl mx-auto pb-12">
            <Outlet />
          </div>
        </main>
      </div>
      <CampusAIAssistant />
    </div>
  );
};

export default DashboardLayout;
