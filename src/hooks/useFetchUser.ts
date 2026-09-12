import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";
import Axios from "@/utils/Axios";
import type { AppDispatch } from "@/store/store";

const useFetchUser = () => {
  const dispatch = useDispatch<AppDispatch>();

  const fetchUser = useCallback(async (): Promise<boolean> => {
    try {
      const res = await Axios.get("/user/profile");
      const raw = res.data;
      const user = raw?.user || raw?.data?.user || raw?.data || raw;
      if (!user || (!user.id && !user.email)) {
        return false;
      }
      dispatch(setUser({
        id: user.id || "",
        name: user.name || "",
        email: user.email || "",
        college: user.college || "",
        branch: user.branch || "",
        year: user.year || "",
        phone: user.phone || user.phoneNo || "",
        role: user.role || "USER",
        photoUrl: user.profileImage || user.image || "",
      }));
      return true;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return false;
    }
  }, [dispatch]);

  return { fetchUser };
};

export default useFetchUser;
