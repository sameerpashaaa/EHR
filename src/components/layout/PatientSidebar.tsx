"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}

const NAV_ITEMS = [
  { name: "My Health", path: "/patient-portal", icon: "health_and_safety" },
  { name: "Appointments", path: "/patient-portal/appointments", icon: "calendar_month" },
  { name: "Messages", path: "/patient-portal/messages", icon: "forum" },
  { name: "Lab Results", path: "/patient-portal/results", icon: "science" },
  { name: "Billing", path: "/patient-portal/billing", icon: "payments" },
];

export default function PatientSidebar() {
  const pathname = usePathname();

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col ${plusJakarta.className}`}>
      <div className="p-6">
        <Link href="/patient-portal" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Icon name="medical_services" className="text-white text-sm" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">
            Patient Portal
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon 
                name={item.icon} 
                className={isActive ? "text-blue-600" : "text-gray-400"} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link
          href="/api/auth/signout?callbackUrl=/login"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
        >
          <Icon name="logout" className="text-red-500" />
          <span className="font-medium">Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
