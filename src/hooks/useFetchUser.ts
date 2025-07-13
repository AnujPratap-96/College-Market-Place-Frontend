// src/hooks/useFetchUser.ts
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";
import Axios from "@/utils/Axios";
import type { AppDispatch } from "@/store/store";

/**
 * Hook that returns a memoized function to fetch the user profile.
 */
const useFetchUser = () => {
  const dispatch = useDispatch<AppDispatch>();

  const fetchUser = useCallback(async (): Promise<boolean> => {
    try {
      const res = await Axios.get("/api/user/profile" ,{});
    
      dispatch(setUser(res.data));
      return true;
    } catch (error) {
      console.error("❌ Failed to fetch user:", error);
      return false;
    }
  }, [dispatch]);

  return { fetchUser };
};

export default useFetchUser;
