import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!CLIENT_ID) {
  }

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </GoogleOAuthProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
