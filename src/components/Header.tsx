import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { AiOutlineLogin, AiOutlineSearch } from "react-icons/ai"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ModeToggle from "@/utils/mode.toggle"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux";
import { clearUser } from "@/store/userSlice"
import Axios from "@/utils/Axios"

const Header = () => {
  const user = useSelector((state: RootState) => state.user)
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => {
    if (user) {
      navigate("/home")
      return;
    };
    navigate("/");
  }
    const logout = async () => {
    try {
      await Axios.post("/api/user/logout"); // or just "/auth/logout"
      dispatch(clearUser()); // Clear user in Redux
      navigate("/auth/login"); // Redirect to login
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="w-full top-0 fixed z-50 px-6 py-4 border-b shadow-sm bg-background/80 backdrop-blur-md border-border flex items-center justify-between">

      {/* Left: Logo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-3xl font-semibold tracking-tight text-foreground"
      >
        <button onClick={handleClick} className="transition-colors duration-200">
          College<span className="text-orange-400">Mart</span>
        </button>
      </motion.div>


      {/* Center: Search bar with animation */}
      <AnimatePresence>
        {user.isLoggedIn && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="relative w-full max-w-md mx-6 hidden md:block"
          >
            <Input
              type="text"
              placeholder="Search items..."
              className="pl-4 pr-10 h-10 rounded-md border-orange-400 focus-visible:ring-orange-400"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-orange-400"
            >
              <AiOutlineSearch size={20} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right: Theme toggle + User Auth */}
      <div className="flex items-center gap-3">
        <ModeToggle />

        {user.isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer h-10 w-10">
                <AvatarImage
                  src={
                    user.photoUrl ||
                    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  }
                  alt="User"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            className="bg-orange-400 hover:bg-orange-500 text-white font-medium px-5"
            asChild
          >
            <Link to="/auth/login" className="flex items-center gap-2">
              <AiOutlineLogin size={20} />
              Login
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}

export default Header
