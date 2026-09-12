import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  Menu,
  X,
  Plus,
  CalendarCheck,
  MessageSquare,
  ShieldAlert,
  Gavel,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { RootState } from "@/store/store";
import { fetchUnreadCount } from "@/modules/messages/message.api";
import { setUnreadTotal } from "@/store/messagesSlice";
import { clearUser } from "@/store/userSlice";
import Axios from "@/utils/Axios";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toast";

const navLinks = [
  { to: "/dashboard", label: "Browse", icon: <LayoutDashboard size={20} /> },
  { to: "/dashboard/products", label: "My Listings", icon: <Package size={20} /> },
  { to: "/dashboard/auctions", label: "Live Auctions", icon: <Gavel size={20} /> },
  { to: "/dashboard/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
  { to: "/dashboard/subscriptions", label: "Subscriptions", icon: <CalendarCheck size={20} /> },
  { to: "/dashboard/messages", label: "Messages", icon: <MessageSquare size={20} /> },
  { to: "/dashboard/profile", label: "Profile", icon: <User size={20} /> },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    try {
      await Axios.post("/user/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("signupToken");
      localStorage.removeItem("resetToken");
      dispatch(clearUser());
      toast.success("Logged out successfully");
      navigate("/auth/login");
    }
  };
  const unreadTotal = useSelector((state: RootState) => {
    if (typeof state.messages?.unreadTotal === "number" && state.messages.unreadTotal > 0) {
      return state.messages.unreadTotal;
    }
    return (
      state.messages?.conversations?.reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0
      ) ?? 0
    );
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchUnreadCount().then((res) => {
      if (typeof res.unreadCount === "number") {
        dispatch(setUnreadTotal(res.unreadCount));
      }
    });
  }, [dispatch]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {isMobile && (
        <button
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-20 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg hover:bg-accent"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {mobileOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          ${isMobile
            ? `fixed top-0 left-0 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out ${
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "fixed top-16 left-0 bottom-0 z-30 w-64 h-[calc(100vh-4rem)]"
          }
          bg-card border-r border-border
          flex flex-col overflow-hidden
        `}
      >
        <div className="p-6 border-b border-border md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CM</span>
            </div>
            <span className="font-semibold text-lg">CampusMart</span>
          </Link>
        </div>

        <div className="p-4 shrink-0">
          <Button asChild className="w-full gap-2" onClick={() => setMobileOpen(false)}>
            <Link to="/dashboard/products/create">
              <Plus className="w-4 h-4" />
              List New Item
            </Link>
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 scroll-smooth">
          <ul className="space-y-1">
            {[
              ...navLinks,
              ...(user.role === 'ADMIN'
                ? [{ to: "/dashboard/admin", label: "Admin Portal", icon: <ShieldAlert size={20} /> }]
                : []),
            ].map(({ to, label, icon }) => {
              const isActive =
                location.pathname === to ||
                (to !== "/dashboard" && location.pathname.startsWith(to));
              const isMessages = to === "/dashboard/messages";
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-lg
                      font-medium transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {icon}
                      <span className="truncate">{label}</span>
                    </div>
                    {isMessages && unreadTotal > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-destructive rounded-full shrink-0">
                        {unreadTotal > 99 ? "99+" : unreadTotal}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-border shrink-0 space-y-2">
          <Link
            to="/dashboard/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent transition-colors group"
          >
            <Avatar className="w-9 h-9 border border-border">
              <AvatarImage src={user.photoUrl} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user.name ? user.name.trim().charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium truncate text-sm text-foreground group-hover:text-primary transition-colors">
                {user.name || "Student"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.college || user.branch || "Campus Member"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 hover:border-destructive/30 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
