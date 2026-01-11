// frontend/src/pages/debug-ssr.jsx
import { useEffect, useState } from 'react';
import UserLayout from '@/layouts/UserLayout';

const DebugSSR = ({ serverData, serverTime }) => {
  const [clientData, setClientData] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Gather client-side data
    const localToken = localStorage.getItem('token');
    const allCookies = document.cookie;
    const cookieToken = allCookies
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    setClientData({
      localStorage: {
        token: localToken ? `${localToken.substring(0, 30)}...` : 'null',
        hasToken: !!localToken
      },
      cookies: {
        token: cookieToken ? `${cookieToken.substring(0, 30)}...` : 'null',
        hasToken: !!cookieToken,
        allCookies: allCookies
      },
      window: {
        location: window.location.href,
        userAgent: navigator.userAgent
      },
      time: new Date().toISOString()
    });
  }, []);

  const testSSREndpoint = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:3000/api/test-ssr', {
        headers: {
          'Cookie': document.cookie
        }
      });
      
      const data = await response.json();
      alert('SSR Test Response: ' + JSON.stringify(data, null, 2));
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">SSR Debug Information</h1>

        {/* Hydration Warning */}
        {!mounted && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">⚠️ Page is still hydrating...</p>
          </div>
        )}

        {/* Server-Side Data */}
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
            </svg>
            Server-Side Data (from getServerSideProps)
          </h2>
          <div className="bg-white rounded p-4 font-mono text-sm overflow-x-auto">
            <pre>{JSON.stringify(serverData, null, 2)}</pre>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Server Time: {serverTime}
          </p>
        </div>

        {/* Client-Side Data */}
        <div className="bg-green-50 border border-green-300 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
            </svg>
            Client-Side Data (from useEffect)
          </h2>
          {clientData ? (
            <div className="bg-white rounded p-4 font-mono text-sm overflow-x-auto">
              <pre>{JSON.stringify(clientData, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-gray-500">Loading client data...</p>
          )}
        </div>

        {/* Hydration Check */}
        <div className={`border rounded-lg p-6 mb-6 ${mounted ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
          <h2 className="text-xl font-semibold mb-4">Hydration Status</h2>
          <p className="text-lg">
            {mounted ? '✅ Page has hydrated successfully' : '⏳ Waiting for hydration...'}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Hydration is the process where React attaches event handlers to the server-rendered HTML.
          </p>
        </div>

        {/* Common SSR Issues */}
        <div className="bg-purple-50 border border-purple-300 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Common SSR Issues Checklist</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className={clientData?.localStorage.hasToken || clientData?.cookies.hasToken ? '✅' : '❌'}></span>
              <span>Authentication token available</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={serverData.hasToken ? '✅' : '❌'}></span>
              <span>Token available during SSR</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={mounted ? '✅' : '⏳'}></span>
              <span>Component hydrated</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={clientData?.localStorage.hasToken === clientData?.cookies.hasToken ? '✅' : '⚠️'}></span>
              <span>localStorage and cookies in sync</span>
            </li>
          </ul>
        </div>

        {/* Test Buttons */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-3">
            <button
              onClick={testSSREndpoint}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Test SSR Endpoint
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
                window.location.reload();
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Clear All Tokens & Reload
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-6 bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">SSR Debugging Tips</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Check that cookies are being set correctly on login</li>
            <li>Ensure getServerSideProps can access cookies from the request</li>
            <li>Avoid using localStorage directly in component render (causes hydration mismatch)</li>
            <li>Use useEffect for client-only code</li>
            <li>Check browser console for hydration warnings</li>
            <li>Verify token format matches between client and server</li>
          </ol>
        </div>
      </div>
    </UserLayout>
  );
};

export async function getServerSideProps(context) {
  // Get token from cookies
  const cookies = context.req.headers.cookie || '';
  const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
  const token = tokenCookie ? tokenCookie.split('=')[1] : null;

  return {
    props: {
      serverData: {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 30)}...` : null,
        cookies: cookies ? `${cookies.substring(0, 100)}...` : 'none',
        headers: {
          userAgent: context.req.headers['user-agent'],
          host: context.req.headers['host']
        }
      },
      serverTime: new Date().toISOString()
    }
  };
}

export default DebugSSR;
