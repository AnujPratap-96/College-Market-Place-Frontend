// ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import useFetchUser from "@/hooks/useFetchUser";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: RootState) => state.user);
  const { fetchUser } = useFetchUser();
  const location = useLocation();
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const [loading, setLoading] = useState(!user.isLoggedIn && Boolean(token));

  useEffect(() => {
    let isMounted = true;
    if (!user.isLoggedIn && token) {
      fetchUser()
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [user.isLoggedIn, token, fetchUser]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return user.isLoggedIn ? (
    <>{children}</>
  ) : (
    <Navigate to="/auth/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
