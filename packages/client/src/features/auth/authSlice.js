import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  accessToken: localStorage.getItem("access_token") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setGoogleUser: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("access_token", accessToken);
    },
    logoutUser: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
    },
  },
});

export const { setGoogleUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
