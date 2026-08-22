"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LegacyPortalRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 text-slate-600 font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        <span>Redirecting to Unified Login...</span>
      </div>
    </div>
  );
}
