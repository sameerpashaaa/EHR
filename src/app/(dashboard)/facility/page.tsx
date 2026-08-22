"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FacilityPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/facility/overview");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-[#4CAF72] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#64748b]">Redirecting to Overview...</span>
      </div>
    </div>
  );
}
