import { RouterProvider } from "react-router-dom";
import router from "./router/index.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.tsx";
import { Toaster } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { CookieConsent } from "@/components/common/CookieConsent";

const App = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <div className="min-h-screen w-full">
          <RouterProvider router={router} />
          <Toaster />
          <CookieConsent />
        </div>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
