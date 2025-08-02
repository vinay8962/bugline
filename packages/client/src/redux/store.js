// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
