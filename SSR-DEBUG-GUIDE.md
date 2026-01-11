# SSR Debugging Guide for CarrerNet

## 🐛 What is SSR and Why Does It Matter?

**Server-Side Rendering (SSR)** means Next.js renders your pages on the server first before sending them to the browser. This causes issues when you use browser-only APIs like `localStorage`, `window`, or `document` during the initial render.

## 🔍 Debug Tools Available

### 1. Debug SSR Page
Visit: `http://localhost:3000/debug-ssr`

This page shows:
- ✅ Server-side data (what was available during SSR)
- ✅ Client-side data (what's available after hydration)
- ✅ Hydration status
- ✅ Token availability check
- ✅ Common issues checklist

### 2. Debug Token Page
Visit: `http://localhost:3000/debug-token`

This page shows:
- Token in localStorage
- Token in cookies
- All cookies
- Token validation test

## 🚨 Common SSR Issues & Fixes

### Issue 1: localStorage is not defined
**Error:** `ReferenceError: localStorage is not defined`

**Problem:** Accessing localStorage during SSR (server doesn't have localStorage)

**Fix:**
```javascript
// ❌ Bad - Causes SSR error
const token = localStorage.getItem('token');

// ✅ Good - Use safe wrapper
import { safeLocalStorage } from '@/utils/ssr-debug';
const token = safeLocalStorage.getItem('token');

// ✅ Or check if on client
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
}
```

### Issue 2: Hydration Mismatch
**Error:** `Warning: Text content did not match. Server: "..." Client: "..."`

**Problem:** Server renders different content than client

**Fix:**
```javascript
// ❌ Bad - Different on server vs client
return <div>{new Date().toLocaleString()}</div>;

// ✅ Good - Use state after mount
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return <div>Loading...</div>;
return <div>{new Date().toLocaleString()}</div>;
```

### Issue 3: Missing Token During SSR
**Problem:** Token in localStorage isn't available during SSR

**Fix:** We're already setting cookies! Make sure to:

1. **Login/Register** - Already sets both localStorage AND cookies:
```javascript
// In authAction/index.js - ALREADY IMPLEMENTED ✅
localStorage.setItem("token", token);
setCookie('token', token, 1);
```

2. **SSR Pages** - Read from cookies in `getServerSideProps`:
```javascript
// ALREADY IMPLEMENTED in viewProfile/[username].jsx ✅
export async function getServerSideProps(context) {
  const cookies = context.req.headers.cookie || '';
  const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
  const token = tokenCookie ? tokenCookie.split('=')[1] : null;
  
  // Use token for API calls...
}
```

## 📋 Pages Status

### ✅ Fixed Pages
- **viewProfile/[username].jsx** - Now uses SSR with getServerSideProps
  - ✅ Reads token from cookies
  - ✅ Uses safe localStorage wrapper
  - ✅ Proper error handling
  - ✅ Debug logging

### ⚠️ Pages That Need SSR Fixes

1. **dashboard/index.jsx**
   - Issue: Uses "use client" directive (not needed in Pages Router)
   - Issue: Direct localStorage access
   - Issue: No getServerSideProps

2. **discover/index.jsx**
   - Needs review for SSR issues

3. **myconnections/index.jsx**
   - Needs review for SSR issues

## 🔧 How to Fix a Page

### Step 1: Remove "use client" directive
```javascript
// ❌ Remove this (only for App Router)
"use client";
```

### Step 2: Replace localStorage with safe wrapper
```javascript
// ❌ Old
const token = localStorage.getItem('token');

// ✅ New
import { safeLocalStorage } from '@/utils/ssr-debug';
const token = safeLocalStorage.getItem('token');
```

### Step 3: Add getServerSideProps (if needed)
```javascript
export async function getServerSideProps(context) {
  const cookies = context.req.headers.cookie || '';
  const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
  const token = tokenCookie ? tokenCookie.split('=')[1] : null;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Fetch data server-side if needed
  return {
    props: {
      // Pass data to component
    },
  };
}
```

## 🧪 Testing SSR

### 1. Check Browser Console
Look for:
- ❌ Hydration errors
- ❌ "localStorage is not defined"
- ❌ "window is not defined"

### 2. Check Terminal (Server logs)
Look for:
- ✅ SSR log messages
- ✅ Token availability
- ❌ Any SSR errors

### 3. Use Debug Pages
- Visit `/debug-ssr` to see server vs client data
- Visit `/debug-token` to verify token storage

### 4. Test with JavaScript Disabled
- Disable JS in browser
- Page should still render (with SSR)
- Content should be visible

## 📝 Best Practices

### DO ✅
- Use `getServerSideProps` for data fetching
- Store auth tokens in both localStorage AND cookies
- Use safe wrappers for browser APIs
- Check `typeof window !== 'undefined'` before using browser APIs
- Use `useEffect` for client-only code
- Add proper error handling

### DON'T ❌
- Access localStorage during component render
- Use `window` or `document` outside useEffect
- Assume browser APIs are available
- Mix "use client" with Pages Router
- Forget to handle loading states

## 🎯 Quick Checklist for SSR

When creating/fixing a page:

- [ ] No "use client" directive (Pages Router)
- [ ] No direct localStorage access
- [ ] Use safeLocalStorage wrapper
- [ ] Add getServerSideProps if fetching data
- [ ] Token read from cookies in SSR
- [ ] Proper loading/error states
- [ ] useEffect for client-only code
- [ ] Test with `/debug-ssr` page
- [ ] Check browser console for errors
- [ ] Check server logs for SSR errors

## 🔗 Useful Files

- `/utils/ssr-debug.js` - Safe wrappers for browser APIs
- `/pages/debug-ssr.jsx` - SSR debugging dashboard
- `/pages/debug-token.jsx` - Token debugging
- `/pages/viewProfile/[username].jsx` - Example of proper SSR

## 🆘 Still Having Issues?

1. Check `/debug-ssr` page for detailed information
2. Check browser console for hydration errors
3. Check server logs for SSR errors
4. Verify cookies are being set on login
5. Test token with `/debug-token` page
6. Clear all tokens and login again

## 📚 Resources

- [Next.js SSR Documentation](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props)
- [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)
- [Cookies vs localStorage](https://javascript.info/cookie)
