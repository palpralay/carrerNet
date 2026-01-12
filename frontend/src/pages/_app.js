import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "../redux/config/store";
import { useEffect } from "react";
import { setAuthFromStorage } from "@/redux/config/reducer/authReducer";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const currentState = store.getState();
    
    // Only set auth from storage if not already logged in and not loading
    if (!currentState.auth.loggedIn && !currentState.auth.isLoading) {
      store.dispatch(setAuthFromStorage({ token }));
    }
  }, []);

  return (
    <Provider store={store}>
      <Toaster position="top-right" richColors />
      <Component {...pageProps} />
    </Provider>
  );
}
