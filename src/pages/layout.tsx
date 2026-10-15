import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import Header from "@/components/Header";
import useFetchUser from "@/hooks/useFetchUser";
import { scrollToTop } from "@/utils/scroll";

const Layout = () => {
  const user = useSelector((state: RootState) => state.user);
  const { fetchUser } = useFetchUser();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const reFetchUser = async () => {
    const success = await fetchUser();
    if (success) {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    if (user.isLoggedIn) navigate("/dashboard");
    else {
      reFetchUser();
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full relative flex flex-col bg-background text-foreground">
      <Header />
      <main className="pt-16 w-full flex-1">
        <Outlet />
      </main>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => scrollToTop()}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-card/90 backdrop-blur-md border border-border/80 text-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 shadow-lg shadow-black/5 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
        >
          <ArrowUp className="w-5 h-5 text-orange-500" />
        </button>
      )}
    </div>
  );
};

export default Layout;
