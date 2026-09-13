import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { AiOutlineSearch } from "react-icons/ai"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link, useLocation, useNavigate } from "react-router-dom"
import ModeToggle from "@/utils/mode.toggle"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { GraduationCap, Menu, X, ArrowRight } from "lucide-react"

const NAV_LINKS = [
  { label: "Explore", href: "#explore" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Auctions", href: "#auctions" },
  { label: "Escrow Safety", href: "#safety" },
  { label: "FAQ", href: "#faq" },
];

const Header = () => {
  const user = useSelector((state: RootState) => state.user)
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + href);
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
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
    <header className="w-full top-0 fixed z-50 px-4 md:px-8 py-3 border-b shadow-xs bg-background/85 backdrop-blur-xl border-border/80 flex items-center justify-between transition-all">
      {/* Left: Logo */}
      <div className="flex items-center gap-6">
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
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
        </motion.button>

        {/* Desktop Nav Links (When logged out) */}
        {!user.isLoggedIn && (
          <nav className="hidden lg:flex items-center gap-1 pl-2">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* Center: Search bar with animation (When logged in) */}
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
            <Input
              type="text"
              placeholder="Search campus gear, books, cycles, tutoring..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-4 pr-10 h-10 rounded-full border-border/80 focus-visible:ring-orange-500 bg-muted/40"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-600 rounded-full"
            >
              <AiOutlineSearch size={18} />
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <ModeToggle />

        {!user.isLoggedIn ? (
          <>
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-semibold text-foreground/80 hover:text-foreground"
                asChild
              >
                <Link to="/auth/login">Log In</Link>
              </Button>

              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-md shadow-orange-500/20 px-4 gap-1.5"
                asChild
              >
                <Link to="/auth/signup">
                  <span>Join Campus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {!user.isLoggedIn && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-border shadow-xl px-6 py-5 flex flex-col gap-4 lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className="px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-border flex flex-col gap-2.5">
              <Button variant="outline" className="w-full justify-center text-sm font-semibold" asChild>
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button
                className="w-full justify-center bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-md shadow-orange-500/20"
                asChild
              >
                <Link to="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  Join With College Email
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
