// frontend/src/redux/config/action/authAction/index.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/redux/config/index.jsx";

// Helper function to set cookie
const setCookie = (name, value, days = 1) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    document.cookie = cookieString;
    
    console.log("🍪 Setting cookie:", name);
    console.log("🍪 Cookie value length:", value.length);
    console.log("🍪 Cookie first 30 chars:", value.substring(0, 30) + "...");
    
    // Verify cookie was set
    setTimeout(() => {
      const allCookies = document.cookie;
      console.log("🍪 All cookies after setting:", allCookies);
      const wasSet = allCookies.includes(`${name}=`);
      console.log("🍪 Cookie was set successfully:", wasSet);
    }, 100);
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

      // Store in localStorage
      localStorage.setItem("token", token);
      
      // Store in cookie for SSR
      setCookie('token', token, 1); // 1 day expiry
      
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
        // Store in localStorage
        localStorage.setItem("token", token);
        
        // Store in cookie for SSR
        setCookie('token', token, 1); // 1 day expiry
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

      // Clear from localStorage
      localStorage.removeItem("token");
      
      // Clear from cookies
      removeCookie('token');
      
      return { message: "Logged out successfully" };
    } catch (error) {
      // Clear tokens even if API call fails
      localStorage.removeItem("token");
      removeCookie('token');
      
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

export default clientServer;