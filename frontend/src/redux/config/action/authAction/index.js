// frontend/src/redux/config/action/authAction/index.js
// FIXED VERSION with proper cookie handling

import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/redux/config/index.jsx";

// Helper function to set cookie with proper domain and security settings
const setCookie = (name, value, days = 7) => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    // Set cookie with explicit domain and path
    const domain = window.location.hostname === 'localhost' ? '' : `;domain=${window.location.hostname}`;
    const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/${domain};SameSite=Lax`;
    
    document.cookie = cookieString;
    
    // Verify cookie was set
    console.log('Cookie set:', cookieString);
    console.log('All cookies after set:', document.cookie);
  }
};

// Helper function to remove cookie
const removeCookie = (name) => {
  if (typeof window !== 'undefined') {
    const domain = window.location.hostname === 'localhost' ? '' : `;domain=${window.location.hostname}`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/${domain}`;
  }
};

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      console.log('Login attempt with:', { email: user.email });
      
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      console.log('Login response:', response.data);

      const token = response.data?.token;

      if (!token) {
        console.error('No token in response:', response.data);
        return thunkAPI.rejectWithValue("No token received from server");
      }

      // Store token in localStorage first
      localStorage.setItem("token", token);
      console.log('Token stored in localStorage:', token.substring(0, 20) + '...');
      
      // Then set cookie
      setCookie('token', token, 7);
      
      // Verify storage worked
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        console.error('Failed to store token in localStorage');
        return thunkAPI.rejectWithValue("Failed to save authentication");
      }
      
      console.log('Login successful - token saved');
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.message || "Login failed";
      return thunkAPI.rejectWithValue(errorMsg);
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      console.log('Registration attempt');
      
      const response = await clientServer.post("/register", {
        username: user.username,
        name: user.name,
        email: user.email,
        password: user.password,
      });

      console.log('Registration response:', response.data);

      const token = response.data?.token;
      
      if (token) {
        localStorage.setItem("token", token);
        setCookie('token', token, 7);
        console.log('Registration successful - token stored');
      }

      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
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
        console.error('getAboutUser: No token available');
        return thunkAPI.rejectWithValue("No token available");
      }
      
      console.log('Fetching user data with token');
      
      const response = await clientServer.get("/get_user_and_profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('User data fetched successfully');
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      console.error('getAboutUser error:', error.response?.data || error.message);
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

// Update user basic info (name, username, email)
export const updateUserInfo = createAsyncThunk(
  "user/updateUserInfo",
  async (userData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No token available");
      }

      const response = await clientServer.post(
        "/user_update",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('User info updated successfully');
      return response.data;
    } catch (error) {
      console.error('Update user info error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update user info"
      );
    }
  }
);

// Update profile data (bio, currentPost, pastWork, education)
export const updateProfileData = createAsyncThunk(
  "user/updateProfileData",
  async (profileData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No token available");
      }

      const response = await clientServer.post(
        "/update_profile_data",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Profile data updated successfully');
      return response.data;
    } catch (error) {
      console.error('Update profile data error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update profile data"
      );
    }
  }
);

// Upload profile picture
export const uploadProfilePicture = createAsyncThunk(
  "user/uploadProfilePicture",
  async (formData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No token available");
      }

      const response = await clientServer.post(
        "/upload_profile_picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log('Profile picture uploaded successfully');
      return response.data;
    } catch (error) {
      console.error('Upload profile picture error:', error.response?.data || error.message);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to upload profile picture"
      );
    }
  }
)







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
      
      console.log('Logout successful - tokens cleared');
      
      return { message: "Logged out successfully" };
    } catch (error) {
      // Clear tokens even if logout API fails
      localStorage.removeItem("token");
      removeCookie('token');
      
      console.error('Logout error (tokens cleared anyway):', error.message);
      
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

export default clientServer;