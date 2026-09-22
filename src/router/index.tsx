import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/pages/layout";
import LandingPage from "@/pages/LandingPage";
import ProtectedRoute from "@/components/ProtectedRoute";

const PageLoader = () => (
  <div className="flex h-[50vh] min-h-[300px] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-orange-500 border-t-transparent" />
      <span className="text-xs font-medium text-muted-foreground">Loading...</span>
    </div>
  </div>
);

const Lazy = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// Auth routes (lazy)
const Auth = lazy(() => import("@/pages/auth"));
const LoginForm = lazy(() => import("@/components/auth/LoginForm"));
const VerifyEmail = lazy(() => import("@/components/auth/VerifyEmail"));
const OtpInput = lazy(() => import("@/components/auth/OtpInput"));
const SignupForm = lazy(() => import("@/components/auth/SignUp"));
const ThankYou = lazy(() => import("@/components/auth/Thankyou"));
const ForgotPassword = lazy(() => import("@/components/auth/ForgotPassword"));
const ResetOtp = lazy(() => import("@/components/auth/ResetOtp"));
const ResetPassword = lazy(() => import("@/components/auth/ResetPassword"));

// Dashboard routes (lazy)
const DashboardLayout = lazy(() => import("@/components/layout/DashboardLayout"));
const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const CreateListing = lazy(() => import("@/pages/CreateListing"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const EditListing = lazy(() => import("@/pages/EditListing"));
const Orders = lazy(() => import("@/pages/Orders"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));
const WantedBoard = lazy(() => import("@/pages/WantedBoard"));
const Auctions = lazy(() => import("@/pages/Auctions"));
const Messages = lazy(() => import("@/pages/Messages"));
const SellerAnalytics = lazy(() => import("@/pages/SellerAnalytics"));
const Profile = lazy(() => import("@/pages/Profile"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "auth",
        element: Lazy(Auth),
        children: [
          { path: "login", element: Lazy(LoginForm) },
          { path: "signup", element: Lazy(VerifyEmail) },
          { path: "verify-otp", element: Lazy(OtpInput) },
          { path: "complete-signup", element: Lazy(SignupForm) },
          { path: "thank-you", element: Lazy(ThankYou) },
          { path: "forgot-password", element: Lazy(ForgotPassword) },
          { path: "reset-otp", element: Lazy(ResetOtp) },
          { path: "reset-password", element: Lazy(ResetPassword) },
        ],
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        {Lazy(DashboardLayout)}
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: Lazy(Home) },
      { path: "products", element: Lazy(Products) },
      { path: "products/create", element: Lazy(CreateListing) },
      { path: "products/:id", element: Lazy(ProductDetail) },
      { path: "products/:id/edit", element: Lazy(EditListing) },
      { path: "orders", element: Lazy(Orders) },
      { path: "subscriptions", element: Lazy(Subscriptions) },
      { path: "wanted", element: Lazy(WantedBoard) },
      { path: "auctions", element: Lazy(Auctions) },
      { path: "messages", element: Lazy(Messages) },
      { path: "analytics", element: Lazy(SellerAnalytics) },
      { path: "profile", element: Lazy(Profile) },
      { path: "admin", element: Lazy(AdminDashboard) },
    ],
  },
]);

export default router;