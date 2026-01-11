// frontend/src/pages/debug-token.jsx
import { useEffect, useState } from 'react';
import UserLayout from '@/layouts/UserLayout';

const DebugToken = () => {
  const [tokenInfo, setTokenInfo] = useState({
    localStorage: null,
    cookies: null,
    allCookies: null,
  });

  const refreshTokenInfo = () => {
    // Get from localStorage
    const localToken = localStorage.getItem('token');
    
    // Get from cookies
    const allCookies = document.cookie;
    console.log("🔍 All cookies:", allCookies);
    
    const cookieToken = allCookies
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    console.log("🔍 Cookie token found:", !!cookieToken);
    console.log("🔍 LocalStorage token found:", !!localToken);

    setTokenInfo({
      localStorage: localToken,
      cookies: cookieToken,
      allCookies: allCookies,
    });
  };

  useEffect(() => {
    refreshTokenInfo();
  }, []);

  const testToken = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:9000/get_user_and_profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Token is valid! User: ' + data.user.name);
      } else {
        alert('❌ Token is invalid: ' + data.message);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const manuallySetCookie = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token in localStorage to copy!');
      return;
    }

    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
    document.cookie = `token=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    
    console.log("🍪 Manually set cookie");
    
    // Refresh display
    setTimeout(() => {
      refreshTokenInfo();
      alert('Cookie set! Check the display below.');
    }, 100);
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Token Debug Info</h1>
          <button
            onClick={refreshTokenInfo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            🔄 Refresh
          </button>
        </div>
        
        <div className="space-y-6">
          {/* LocalStorage Token */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">LocalStorage Token</h2>
            {tokenInfo.localStorage ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">Found: ✅</p>
                <p className="text-xs text-gray-500 mb-1">Length: {tokenInfo.localStorage.length}</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                  {tokenInfo.localStorage}
                </p>
              </div>
            ) : (
              <p className="text-red-600">Not found ❌</p>
            )}
          </div>

          {/* Cookie Token */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Cookie Token</h2>
            {tokenInfo.cookies ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">Found: ✅</p>
                <p className="text-xs text-gray-500 mb-1">Length: {tokenInfo.cookies.length}</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                  {tokenInfo.cookies}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-600 mb-3">Not found ❌</p>
                <button
                  onClick={manuallySetCookie}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm"
                >
                  📋 Copy from localStorage to Cookie
                </button>
              </div>
            )}
          </div>

          {/* All Cookies */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">All Cookies</h2>
            <div className="text-xs font-mono bg-gray-100 p-2 rounded break-all max-h-40 overflow-y-auto">
              {tokenInfo.allCookies || 'No cookies found'}
            </div>
            <div className="mt-3">
              <p className="text-sm font-semibold mb-2">Cookie Names:</p>
              <div className="flex flex-wrap gap-2">
                {(tokenInfo.allCookies || '').split(';').map((cookie, idx) => {
                  const name = cookie.trim().split('=')[0];
                  return name ? (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Token Match */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Token Match Status</h2>
            {tokenInfo.localStorage && tokenInfo.cookies ? (
              tokenInfo.localStorage === tokenInfo.cookies ? (
                <p className="text-green-600 text-lg">✅ LocalStorage and Cookie tokens MATCH</p>
              ) : (
                <div>
                  <p className="text-red-600 text-lg mb-2">❌ LocalStorage and Cookie tokens DO NOT MATCH</p>
                  <p className="text-sm text-gray-600">This will cause SSR to fail. Click the button above to sync them.</p>
                </div>
              )
            ) : (
              <p className="text-yellow-600">⚠️ Cannot compare - one or both tokens missing</p>
            )}
          </div>

          {/* Test Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Test Actions</h2>
            <div className="space-y-3">
              <button
                onClick={testToken}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Test Token with API
              </button>
              
              <button
                onClick={() => {
                  window.location.href = '/viewProfile/user10';
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Test SSR with Profile Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default DebugToken;