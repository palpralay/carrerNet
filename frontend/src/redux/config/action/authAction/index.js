// frontend/src/redux/config/action/authAction/index.js
// COMPLETE FIXED VERSION with proper connection request handling

import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/redux/config/index.jsx";

// Helper function to set cookie
const setCookie = (name, value, days = 7) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    document.cookie = cookieString;
  }
};

// Helper function to remove cookie
const removeCookie = (name) => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      const token = response.data?.token;

      if (!token) {
        return thunkAPI.rejectWithValue("No token received");
      }

      localStorage.setItem("token", token);
      setCookie('token', token, 7);
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        username: user.username,
        name: user.name,
        email: user.email,
        password: user.password,
      });

      const token = response.data?.token;
      
      if (token) {
        localStorage.setItem("token", token);
        setCookie('token', token, 7);
      }

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      const token = user?.token || localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No token available");
      }
      
      const response = await clientServer.get("/get_user_and_profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch user data"
      );
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUserProfiles",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_all_users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch all user profiles"
      );
    }
  }
);

// FIXED: Send connection request with proper userId parameter
export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async ({ token, userId }, thunkAPI) => {
    try {
      console.log("Sending connection request to userId:", userId);
      
      const response = await clientServer.post(
        `/user/send_connection_request/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Connection request response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Connection request error:", error.response?.data);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send connection request"
      );
    }
  }
);

// Get connection requests I sent (pending)
export const getConnectionRequests = createAsyncThunk(
  "user/getConnectionRequests",
  async ({ token }, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/getConnectionRequests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch connection requests"
      );
    }
  }
);

// Get connection requests I received (pending)
export const getReceivedRequests = createAsyncThunk(
  "user/getReceivedRequests",
  async ({ token }, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/getReceivedRequests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch received requests"
      );
    }
  }
);

// Get my accepted connections
export const getMyConnections = createAsyncThunk(
  "user/getMyConnections",
  async ({ token }, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/user_connection_request", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch connections"
      );
    }
  }
);

// Accept or reject connection request
export const respondToConnectionRequest = createAsyncThunk(
  "user/respondToConnectionRequest",
  async ({ token, requestID, action }, thunkAPI) => {
    try {
      const response = await clientServer.post(
        `/user/accept_connection_request/${requestID}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return { ...response.data, action };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to respond to connection request"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");

      if (token) {
        await clientServer.post(
          "/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      localStorage.removeItem("token");
      removeCookie('token');
      
      return { message: "Logged out successfully" };
    } catch (error) {
      localStorage.removeItem("token");
      removeCookie('token');
      
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

export default clientServer;