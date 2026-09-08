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
      const data = res.data;
      dispatch(setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        college: data.college,
        branch: data.branch,
        year: data.year,
        phone: data.phone,
        photoUrl: data.profileImage || data.image || "",
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
