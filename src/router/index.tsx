import { createBrowserRouter } from "react-router-dom";
import Auth from "@/pages/auth";
import LoginForm from "@/components/auth/LoginForm";
import VerifyEmail from "@/components/auth/VerifyEmail";
import Home from "@/pages/Home";
import Layout from "@/pages/layout";
import OtpInput from "@/components/auth/OtpInput";
import LandingPage from "@/pages/LandingPage";
import SignupForm from "@/components/auth/SignUp";
import ThankYou from "@/components/auth/Thankyou";

const router = createBrowserRouter([
  {
    path: "/", // Main layout with Header + Outlet
    element: <Layout />,
    children: [
      {
          path: "",  element: <LandingPage/>// ✅ no leading slash, matches root
      },
      {
        path: "auth", // ✅ no leading slash
        element: <Auth />,
        children: [
          {
            path: "login", // ✅ correct relative path
            element: <LoginForm />,
          },
          {
            path: "signup",
            element: <VerifyEmail />,
          },
          {
            path: "verify-otp",
            element: <OtpInput />,
          },
          {
            path: "complete-signup", // ✅ correct relative path
            element: <SignupForm />,
          },
          {
            path: "thank-you",
            element: <ThankYou />,
          }
        ],
      },
      {
        path: "home", // ✅ correct
        element: <Home />,
      },
    ],
  },
]);

export default router;
