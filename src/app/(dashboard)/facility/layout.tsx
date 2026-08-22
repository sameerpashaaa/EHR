"use client";

import { FacilityProvider } from "@/contexts/FacilityContext";

export default function FacilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FacilityProvider>
      {children}
    </FacilityProvider>
  );
}
