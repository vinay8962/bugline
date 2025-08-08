import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bugs: [],
};

const bugSlice = createSlice({
  name: "bug",
  initialState,
  reducers: {
    setBugs(state, action) {
      state.bugs = action.payload;
    },
    addBug(state, action) {
      state.bugs.push(action.payload);
    },
    clearBugs(state) {
      state.bugs = [];
    },
  },
});

export const { setBugs, addBug, clearBugs } = bugSlice.actions;
export default bugSlice.reducer;
