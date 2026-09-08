// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: RootState) => state.user);

  return user.isLoggedIn ? children : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
