import { useRouter } from "next/router";
import React from "react";

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const isActive = (path) => router.pathname === path;

  return (
    <div className="container">
      <div className="home ">
        <div className="sidebar-options fixed top-20 left-6 w-56 space-y-2">
          {/* Home */}
          <div
            onClick={() => {
              router.push("/dashboard");
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition duration-200 ease-out hover:scale-105 hover:bg-gray-100 hover:text-indigo-600 ${
              isActive("/dashboard") ? "bg-indigo-100 text-indigo-600 font-semibold" : ""
            }`}
          >
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
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            <p className="text-base font-medium">Home</p>
          </div>

          {/* Search */}
          <div
            onClick={() => {
              router.push("/discover");
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition duration-200 ease-out hover:scale-105 hover:bg-gray-100 hover:text-indigo-600 ${
              isActive("/discover") ? "bg-indigo-100 text-indigo-600 font-semibold" : ""
            }`}
          >
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
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <p className="text-base font-medium">Discover</p>
          </div>

          {/* Connections */}
          <div
            onClick={() => {
              router.push("/myconnections");
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition duration-200 ease-out hover:scale-105 hover:bg-gray-100 hover:text-indigo-600 ${
              isActive("/myconnections") ? "bg-indigo-100 text-indigo-600 font-semibold" : ""
            }`}
          >
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
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <p className="text-base font-medium">Connections</p>
          </div>
        </div>

        <div className="ml-80">{children}</div>
        <div className="right-0 top-20 fixed w-64 p-4">
            <h3>top profiles</h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
