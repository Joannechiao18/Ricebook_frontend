// authReducer.js
import { createReducer } from "@reduxjs/toolkit";
import { login, register, logout } from "../actions/authActions";

const initialState = {
  currentUser: null,
  isLoggedIn: false,
  profilePic: null,
};

const authReducer = createReducer(initialState, {
  [login]: (state, action) => {
    state.currentUser = action.payload;
    state.isLoggedIn = true;
    state.profilePic = action.payload.profilePic;
  },
  [register]: (state, action) => {
    state.currentUser = action.payload;
    state.isLoggedIn = true;
    state.profilePic = action.payload.profilePic;
  },
  [logout]: (state) => {
    localStorage.removeItem("persist:root");
    localStorage.removeItem("user");
    localStorage.removeItem("userHeadline");
    state.currentUser = null;
    state.isLoggedIn = false;
  },
});

export default authReducer;

export const selectUser = (state) => state.auth.currentUser;
export const selectProfilePic = (state) => state.auth.profilePic;
