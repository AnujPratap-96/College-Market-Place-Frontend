import { createBrowserRouter } from "react-router-dom";
import Auth from "@/pages/auth";
import LoginForm from "@/components/auth/LoginForm";
import VerifyEmail from "@/components/auth/VerifyEmail";
import Home from "@/pages/Home";
import DashboardLayout from "@/pages/DashboardLayout";
import Layout from "@/pages/layout";
import OtpInput from "@/components/auth/OtpInput";
import LandingPage from "@/pages/LandingPage";
import SignupForm from "@/components/auth/SignUp";
import ThankYou from "@/components/auth/Thankyou";
import Products from "@/pages/Products.tsx";
import Orders from "@/pages/Orders.tsx";
import Profile from "@/pages/Profile.tsx";
import ProductDetail from "@/pages/ProductDetail";
import CreateListing from "@/pages/CreateListing";
import ProtectedRoute from "@/components/ProtectedRoute.tsx";
import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetOtp from "@/components/auth/ResetOtp";
import ResetPassword from "@/components/auth/ResetPassword";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "auth",
        element: <Auth />,
        children: [
          { path: "login", element: <LoginForm /> },
          { path: "signup", element: <VerifyEmail /> },
          { path: "verify-otp", element: <OtpInput /> },
          { path: "complete-signup", element: <SignupForm /> },
          { path: "thank-you", element: <ThankYou /> },
          { path: "forgot-password", element: <ForgotPassword /> },
          { path: "reset-otp", element: <ResetOtp /> },
          { path: "reset-password", element: <ResetPassword /> },
        ],
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <Products /> },
      { path: "products/create", element: <CreateListing /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "orders", element: <Orders /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);

export default router;