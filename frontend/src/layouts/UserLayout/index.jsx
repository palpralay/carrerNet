import Navbar from "@/components/Navbar";
import React from "react";
import { Toaster } from "sonner";

const UserLayout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-hidden bg-gray-50">
        {children}
      </main>

      {/* Sonner Toaster */}
      <Toaster
        position="top-right"
        richColors
        closeButton
      />
    </div>
  );
};

export default UserLayout;