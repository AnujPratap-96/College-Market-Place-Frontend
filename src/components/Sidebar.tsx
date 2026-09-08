import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/dashboard", label: "Browse", icon: <LayoutDashboard size={20} /> },
  { to: "/dashboard/products", label: "My Listings", icon: <Package size={20} /> },
  { to: "/dashboard/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
  { to: "/dashboard/profile", label: "Profile", icon: <User size={20} /> },
];

const Sidebar = () => {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
      {/* Mobile Toggle */}
      {isMobile && (
        <button
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-20 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg hover:bg-accent"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Overlay */}
      {mobileOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 left-0 z-40 h-screen w-64
          bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : ""}
          md:translate-x-0
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CM</span>
            </div>
            <span className="font-semibold text-lg">CampusMart</span>
          </Link>
        </div>

        {/* Quick Action */}
        <div className="p-4">
          <Button asChild className="w-full gap-2" onClick={() => setMobileOpen(false)}>
            <Link to="/dashboard/products/create">
              <Plus className="w-4 h-4" />
              List New Item
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {navLinks.map(({ to, label, icon }) => {
              const isActive =
                location.pathname === to ||
                (to !== "/dashboard" && location.pathname.startsWith(to));
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      font-medium transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }
                    `}
                  >
                    {icon}
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent transition-colors">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user.photoUrl} />
                  <AvatarFallback>
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium truncate text-sm">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.college || "Student"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile">Profile Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;