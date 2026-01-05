/**
 * STEPS FOR STATE MANAGEMENT WITH REDUX TOOLKIT
 * submit actions
 * handle actions in it's reducer
 * register here -> reducer
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer/index.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
