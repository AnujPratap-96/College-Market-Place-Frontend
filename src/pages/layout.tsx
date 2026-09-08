// src/pages/layout.tsx
import { useEffect } from "react";
import { Outlet, useNavigate, } from "react-router-dom";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import Header from "@/components/Header";
import useFetchUser from "@/hooks/useFetchUser";


const Layout = () => {
  const user = useSelector((state: RootState) => state.user);
  const { fetchUser } = useFetchUser();
  const navigate = useNavigate();
  const reFetchUser = async () => {
    const success = await fetchUser();
    if (success) {
      navigate("/dashboard");
    }

  }
  useEffect(() => {
    if (user.isLoggedIn) navigate("/dashboard");
    else {
      reFetchUser();
    }

  }, []);

  return (
    <div className="min-h-screen w-full relative">
      <Header />
      {/* Adjust padding-top to avoid overlap with fixed header */}
      <main className="pt-20 px-4 pb-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
