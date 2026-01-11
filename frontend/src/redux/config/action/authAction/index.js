// frontend/src/redux/config/action/authAction/index.js
// FIXED VERSION - Replace your current auth actions

import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/redux/config/index.jsx";

// IMPROVED Helper function to set cookie
const setCookie = (name, value, days = 7) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    // IMPORTANT: Remove encoding that might cause issues
    const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    document.cookie = cookieString;
    
    console.log("🍪 SETTING COOKIE:");
    console.log("  Name:", name);
    console.log("  Value length:", value.length);
    console.log("  First 30 chars:", value.substring(0, 30) + "...");
    console.log("  Expires:", expires.toUTCString());
    
    // Verify it was set
    setTimeout(() => {
      const allCookies = document.cookie;
      console.log("🍪 ALL COOKIES:", allCookies);
      
      // Check specifically for our token
      const tokenCookie = allCookies.split(';').find(c => c.trim().startsWith('token='));
      if (tokenCookie) {
        const extractedToken = tokenCookie.split('=')[1];
        console.log("✅ Token cookie verified!");
        console.log("  Extracted token (first 30):", extractedToken.substring(0, 30) + "...");
        console.log("  Match with original:", extractedToken === value);
      } else {
        console.error("❌ Token cookie NOT found in document.cookie!");
        console.log("Available cookies:", allCookies.split(';').map(c => c.trim().split('=')[0]));
      }
    }, 100);
  }
};

// Helper function to remove cookie
const removeCookie = (name) => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    console.log("🗑️ Removed cookie:", name);
  }
};

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      console.log("🔐 LOGIN: Starting login process...");
      
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      const token = response.data?.token;

      if (!token) {
        console.error("❌ LOGIN: No token in response!");
        return thunkAPI.rejectWithValue("No token received");
      }

      console.log("✅ LOGIN: Token received from server");
      console.log("  Token length:", token.length);
      console.log("  Token preview:", token.substring(0, 30) + "...");

      // Store in localStorage
      localStorage.setItem("token", token);
      console.log("✅ LOGIN: Stored in localStorage");
      
      // Store in cookie for SSR
      setCookie('token', token, 7); // 7 days expiry
      console.log("✅ LOGIN: Cookie set initiated");
      
      return response.data;
    } catch (error) {
      console.error("❌ LOGIN ERROR:", error.response?.data || error.message);
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
      console.log("📝 REGISTER: Starting registration...");
      
      const response = await clientServer.post("/register", {
        username: user.username,
        name: user.name,
        email: user.email,
        password: user.password,
      });

      const token = response.data?.token;
      
      if (token) {
        console.log("✅ REGISTER: Token received");
        console.log("  Token length:", token.length);
        
        // Store in localStorage
        localStorage.setItem("token", token);
        console.log("✅ REGISTER: Stored in localStorage");
        
        // Store in cookie for SSR
        setCookie('token', token, 7); // 7 days expiry
        console.log("✅ REGISTER: Cookie set initiated");
      } else {
        console.warn("⚠️ REGISTER: No token in response");
      }

      return response.data;
    } catch (error) {
      console.error("❌ REGISTER ERROR:", error.response?.data || error.message);
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
      console.log("🗑️ LOGOUT: Cleared localStorage");
      
      // Clear from cookies
      removeCookie('token');
      console.log("🗑️ LOGOUT: Cleared cookies");
      
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