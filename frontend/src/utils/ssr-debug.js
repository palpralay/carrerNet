// frontend/src/utils/ssr-debug.js
// Utility functions for debugging SSR issues

/**
 * Check if code is running on server or client
 */
export const isServer = typeof window === 'undefined';
export const isClient = typeof window !== 'undefined';

/**
 * Safe localStorage access with SSR support
 */
export const safeLocalStorage = {
  getItem: (key) => {
    if (isClient) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage.getItem error:', error);
        return null;
      }
    }
    return null;
  },
  
  setItem: (key, value) => {
    if (isClient) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('localStorage.setItem error:', error);
      }
    }
  },
  
  removeItem: (key) => {
    if (isClient) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('localStorage.removeItem error:', error);
      }
    }
  }
};

/**
 * Safe cookie access with SSR support
 */
export const safeCookies = {
  get: (name) => {
    if (isClient) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop().split(';').shift();
      }
    }
    return null;
  },
  
  set: (name, value, days = 1) => {
    if (isClient) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }
  },
  
  remove: (name) => {
    if (isClient) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
  }
};

/**
 * Debug SSR hydration mismatches
 */
export const debugHydration = (componentName, data) => {
  if (isClient) {
    console.log(`🔍 [${componentName}] Client-side data:`, data);
  } else {
    console.log(`🔍 [${componentName}] Server-side data:`, data);
  }
};

/**
 * Get token from cookies (works on both server and client)
 * For server-side usage, pass context.req
 */
export const getTokenFromCookies = (req = null) => {
  if (req) {
    // Server-side: parse cookies from request headers
    const cookies = req.headers.cookie || '';
    const tokenCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  } else {
    // Client-side
    return safeCookies.get('token');
  }
};

/**
 * Create auth headers with token
 */
export const createAuthHeaders = (token) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Log SSR errors with context
 */
export const logSSRError = (location, error) => {
  console.error(`❌ SSR Error in ${location}:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    isServer: isServer
  });
};
