import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { CampusAIAssistant } from "@/modules/assistant/components/CampusAIAssistant";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <CampusAIAssistant />
    </div>
  );
};

export default DashboardLayout;
