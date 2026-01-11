// frontend/src/pages/debug-token.jsx
import { useEffect, useState } from 'react';
import UserLayout from '@/layouts/UserLayout';

const DebugToken = () => {
  const [tokenInfo, setTokenInfo] = useState({
    localStorage: null,
    cookies: null,
    allCookies: null,
  });

  useEffect(() => {
    // Get from localStorage
    const localToken = localStorage.getItem('token');
    
    // Get from cookies
    const allCookies = document.cookie;
    const cookieToken = allCookies
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    setTokenInfo({
      localStorage: localToken,
      cookies: cookieToken,
      allCookies: allCookies,
    });
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

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Token Debug Info</h1>
        
        <div className="space-y-6">
          {/* LocalStorage Token */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">LocalStorage Token</h2>
            {tokenInfo.localStorage ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">Found: ✅</p>
                <p className="text-xs text-gray-500 mb-1">Length: {tokenInfo.localStorage.length}</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                  {tokenInfo.localStorage.substring(0, 50)}...
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
                  {tokenInfo.cookies.substring(0, 50)}...
                </p>
              </div>
            ) : (
              <p className="text-red-600">Not found ❌</p>
            )}
          </div>

          {/* All Cookies */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">All Cookies</h2>
            <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
              {tokenInfo.allCookies || 'No cookies found'}
            </p>
          </div>

          {/* Token Match */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Token Match Status</h2>
            {tokenInfo.localStorage && tokenInfo.cookies ? (
              tokenInfo.localStorage === tokenInfo.cookies ? (
                <p className="text-green-600">✅ LocalStorage and Cookie tokens MATCH</p>
              ) : (
                <p className="text-red-600">❌ LocalStorage and Cookie tokens DO NOT MATCH</p>
              )
            ) : (
              <p className="text-yellow-600">⚠️ Cannot compare - one or both tokens missing</p>
            )}
          </div>

          {/* Test Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Test Token</h2>
            <button
              onClick={testToken}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Test Token with API
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default DebugToken;