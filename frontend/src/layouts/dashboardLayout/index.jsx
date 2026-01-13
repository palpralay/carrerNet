import { useRouter } from "next/router";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isActive = (path) => router.pathname === path;
  const authState = useSelector((state) => state.auth);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  

  const menuItems = [
    {
      name: "Home",
      path: "/dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      ),
    },
    {
      name: "Discover",
      path: "/discover",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      ),
    },
    {
      name: "Connections",
      path: "/myconnections",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      ),
    },
    {
      name: "Your Profile",
      path: `/viewProfile/${authState.user?.username}`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition"
        aria-label="Toggle Sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out z-40
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full pt-20 lg:pt-6 px-4">
          {/* Close button for mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Menu Items */}
          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => (
              <div
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition duration-200 ease-out hover:scale-105 hover:bg-gray-100 hover:text-indigo-600 ${
                  isActive(item.path)
                    ? "bg-indigo-100 text-indigo-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {item.icon}
                <p className="text-base font-medium">{item.name}</p>
              </div>
            ))}
          </nav>

          {/* User Info at Bottom */}
          <p className="text-center text-xm text-gray-500">
            
            <a
              href="https://www.linkedin.com/in/pralay-pal-40a43a328/"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer hover:text-blue-500"
            >
             made by @Pralay
            </a>
          </p>

          <div className="pb-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                {authState.user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {authState.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {authState.user?.email || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:px-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
