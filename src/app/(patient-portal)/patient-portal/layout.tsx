import { Metadata } from "next";
import PatientSidebar from "@/components/layout/PatientSidebar";

export const metadata: Metadata = {
  title: "Patient Portal",
  description: "View and manage your health records",
};

export default function PatientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa]">
      <PatientSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
