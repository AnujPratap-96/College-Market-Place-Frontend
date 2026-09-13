import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { AiOutlineLogin } from "react-icons/ai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ModeToggle from "@/utils/mode.toggle";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { WalletPill } from "@/modules/wallet/components/WalletPill";
import { NotificationBell } from "@/modules/notifications/components/NotificationBell";
import { GraduationCap, Search, X } from "lucide-react";

const Header = () => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleClick = () => {
    if (user.isLoggedIn) {
      navigate("/dashboard");
      return;
    }
    navigate("/");
  };

  return (
    <header className="w-full top-0 fixed z-50 px-4 md:px-6 h-16 border-b shadow-xs bg-background/85 backdrop-blur-xl border-border/80 flex items-center justify-between transition-all">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center"
      >
        <button onClick={handleClick} className="flex items-center gap-2.5 text-left cursor-pointer group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-all">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-foreground leading-none">
              College<span className="text-orange-500">Mart</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
              Campus Marketplace
            </span>
          </div>
        </button>
      </motion.div>

      <AnimatePresence>
        {user.isLoggedIn && (
          <motion.form
            key="search"
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md mx-4 hidden md:block"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search books, cycles, gigs, meal plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-9 h-10 rounded-xl bg-muted/50 border-border/70 focus-visible:ring-orange-500 text-xs sm:text-sm"
            />
            {!search && (
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border/70 bg-background/70 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground shadow-xs">
                Ctrl K
              </kbd>
            )}
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {user.isLoggedIn ? (
          <>
            <WalletPill />
            <NotificationBell />
          </>
        ) : (
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs sm:text-sm px-4 h-9 rounded-xl shadow-sm"
            asChild
          >
            <Link to="/auth/login" className="flex items-center gap-1.5">
              <AiOutlineLogin size={16} />
              Login
            </Link>
          </Button>
        )}
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
