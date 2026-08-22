"use client";

import React from "react";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import PublicNavbar from "@/components/layout/PublicNavbar";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}

export default function UnauthorizedPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300,0..1&display=swap');
      ` }} />
      <div
        className={`${plusJakarta.className}`}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#f8f9ff",
          color: "#0b1c30",
        }}
      >
        <PublicNavbar />
        
        <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <div className="max-w-md w-full flex flex-col items-center text-center gap-6 z-10 p-10 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
              <Icon name="block" className="text-4xl text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
            
            <p className="text-gray-600 text-lg">
              You don't have permission to access this page or your session belongs to a different portal.
            </p>
            
            <div className="flex flex-col gap-3 w-full mt-4">
              <Link
                href="/"
                className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl transition-colors hover:bg-gray-800"
              >
                Go to Dashboard
              </Link>
              
              <Link
                href="/api/auth/signout?callbackUrl=/login"
                className="w-full bg-white text-gray-700 border border-gray-300 font-medium py-3 rounded-xl transition-colors hover:bg-gray-50"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
