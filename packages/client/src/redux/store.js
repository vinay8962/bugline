// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import bugReducer from "../features/bug/bugSlice.js";
import { apiSlice } from "../services/api.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bug: bugReducer,
    // Add RTK Query reducer
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // Add RTK Query middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore RTK Query action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(apiSlice.middleware),
});
