
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

const Home = () => {


  const user = useSelector((state: RootState) => state.user);

  return (
    <div className="text-xl">
      Welcome, {user?.name || "Guest"}! 🎉
    </div>
  );
};

export default Home;
