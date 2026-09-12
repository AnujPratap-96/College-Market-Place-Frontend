import { RouterProvider } from "react-router-dom";
import router from "./router/index.tsx";
import { Provider } from "react-redux";
import {store} from "./store/store.tsx";
import { Toaster } from "@/components/ui/toast";

const App = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen w-full ">
        <RouterProvider router={router} />
        <Toaster />
      </div>
    </Provider>
  );
};

export default App;
