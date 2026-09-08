import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/")[2] || "login";

  const hideTabsOn = ["verify-otp", "complete-signup", "thank-you", "forgot-password", "reset-otp", "reset-password"];
  const shouldShowTabs = !hideTabsOn.includes(path);

  return (
    <div className="min-h-screen flex items-center justify-center my-[-20px] w-full">
      <div className=" min-w-md px-5 py-2 bg-background text-foreground shadow-2xl rounded-lg h-auto">
        {shouldShowTabs && (
          <Tabs value={path} onValueChange={(val) => navigate(`/auth/${val}`)}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
