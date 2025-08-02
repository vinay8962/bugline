import { createSlice } from "@reduxjs/toolkit";
import { secureStorage } from "../../utils/encryption.js";

const initialState = {
  user: secureStorage.getItem("user") || null,
  accessToken: secureStorage.getItem("authToken") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setGoogleUser: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      // Save to secure storage
      if (user) secureStorage.setItem("user", user);
      if (accessToken) secureStorage.setItem("authToken", accessToken);
    },
    logoutUser: (state) => {
      state.user = null;
      state.accessToken = null;
      // Clear secure storage
      secureStorage.clear();
    },
  },
});

export const { setGoogleUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
