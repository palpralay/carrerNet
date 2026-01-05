import Navbar from "@/components/Navbar";
import React from "react";
import { Toaster } from "sonner";

const UserLayout = ({ children }) => {
  return (
    <div className="h-screen overflow-hidden">
      <Navbar />

      <main className="h-[calc(100vh-64px)] overflow-hidden">
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
