import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "../redux/config/store";
import { useEffect } from "react";
import { setAuthFromStorage } from "@/redux/config/reducer/authReducer";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      store.dispatch(setAuthFromStorage({ token }));
    }
  }, []);

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
