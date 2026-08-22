"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Loader2 } from "lucide-react";
import PublicNavbar from "@/components/layout/PublicNavbar";

// ─── Font ────────────────────────────────────────────────────────────────────
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// ─── Material Symbols icon ──────────────────────────────────────────────────
function Icon({
  name,
  className = "",
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {name}
    </span>
  );
}

// ─── AI Features Bento ──────────────────────────────────────────────────────
const AI_FEATURES = [
  { icon: "psychology",  label: "Neural Symptom Mapper", desc: "Deep pattern recognition across longitudinal patient data." },
  { icon: "description", label: "Auto-Documentation",    desc: "Real-time structured notes generated from ambient audio." },
  { icon: "insights",    label: "Predictive Timeline",   desc: "Visualizing future health trajectories using 4.2B data points." },
  { icon: "bolt",        label: "Ambient Scribe",        desc: "Zero-interaction capture of clinical narratives." },
];

// ─── 6 Quick Login Accounts for MVP ─────────────────────────────────────────
const QUICK_LOGIN_ACCOUNTS = [
  {
    role: "Physician",
    email: "physician@metapharsic.com",
    pass: "physician123",
    icon: "stethoscope",
    color: "#8b5cf6",
    badge: "Clinical Lead",
    title: "Dr. Sarah Johnson",
  },
  {
    role: "Nurse",
    email: "nurse@metapharsic.com",
    pass: "nurse123",
    icon: "health_and_safety",
    color: "#10b981",
    badge: "Care Team",
    title: "Emily Rodriguez, RN",
  },
  {
    role: "Medical Assistant",
    email: "ma@metapharsic.com",
    pass: "ma123",
    icon: "medical_services",
    color: "#06b6d4",
    badge: "Clinical Asst",
    title: "Alex Vance, MA",
  },
  {
    role: "Front Desk",
    email: "frontdesk@metapharsic.com",
    pass: "frontdesk123",
    icon: "how_to_reg",
    color: "#f59e0b",
    badge: "Reception",
    title: "Samantha Reed",
  },
  {
    role: "Admin",
    email: "admin@metapharsic.com",
    pass: "admin123",
    icon: "admin_panel_settings",
    color: "#ef4444",
    badge: "System Admin",
    title: "System Administrator",
  },
  {
    role: "Patient",
    email: "patient@metapharsic.com",
    pass: "patient123",
    icon: "personal_injury",
    color: "#3b82f6",
    badge: "Patient Portal",
    title: "John Smith",
  },
];

const STAT_TOKENS = [
  { value: "1,284", label: "Active Patients" },
  { value: "24",    label: "AI Notes Today" },
  { value: "<12ms", label: "Inference Speed" },
];

// ─── Vanta Background Component ──────────────────────────────────────────────
function VantaBackground() {
  const vantaRef    = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<{ destroy?: () => void } | null>(null);

  useEffect(() => {
    const W = window as any;
    let threeScript: HTMLScriptElement | null = null;
    let vantaScript: HTMLScriptElement | null = null;
    let isCleanedUp = false;

    const tryInit = () => {
      if (isCleanedUp) return;
      if (vantaEffect.current) return;
      if (W.VANTA?.CELLS && vantaRef.current) {
        try {
          vantaEffect.current = W.VANTA.CELLS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200,
            minWidth:  200,
            scale: 1.0,
            color1: 0xdcfce7,
            color2: 0xf0fdf4,
            size: 1.5,
          });
        } catch (e) {
          console.error("Failed to initialize Vanta CELLS:", e);
        }
      }
    };

    const loadVanta = () => {
      if (isCleanedUp) return;
      if (W.VANTA?.CELLS) {
        tryInit();
        return;
      }
      const existingVanta = document.querySelector('script[src*="vanta.cells"]');
      if (existingVanta) {
        existingVanta.addEventListener('load', tryInit);
        if (W.VANTA?.CELLS) tryInit();
        return;
      }
      vantaScript = document.createElement("script");
      vantaScript.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.cells.min.js";
      vantaScript.onload = tryInit;
      document.head.appendChild(vantaScript);
    };

    const loadThree = () => {
      if (isCleanedUp) return;
      if (W.THREE) {
        loadVanta();
        return;
      }
      const existingThree = document.querySelector('script[src*="three.js"]');
      if (existingThree) {
        existingThree.addEventListener('load', loadVanta);
        if (W.THREE) loadVanta();
        return;
      }
      threeScript = document.createElement("script");
      threeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js";
      threeScript.onload = loadVanta;
      document.head.appendChild(threeScript);
    };

    loadThree();

    return () => {
      isCleanedUp = true;
      if (vantaEffect.current) {
        vantaEffect.current.destroy?.();
        vantaEffect.current = null;
      }
      if (threeScript) threeScript.remove();
      if (vantaScript) vantaScript.remove();
    };
  }, []);

  return <div ref={vantaRef} className="fixed inset-0 z-0" aria-hidden="true" />;
}

// ─── Main Unified Login Page ─────────────────────────────────────────────────
export default function UnifiedLoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") || "/";

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState("");
  const [btnPressed,   setBtnPressed]   = useState(false);
  const [activeRole,   setActiveRole]   = useState<string | null>(null);

  // ── Unified Submit Handler ──────────────────────────────────────────────────
  const performLogin = async (targetEmail: string, targetPass: string) => {
    if (!targetEmail.trim() || !targetPass.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    setError("");
    setBtnPressed(true);
    setTimeout(() => setBtnPressed(false), 120);

    try {
      const result = await signIn("credentials", {
        email: targetEmail,
        password: targetPass,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  // ── Quick Login Trigger ─────────────────────────────────────────────────────
  const handleQuickLogin = (acc: typeof QUICK_LOGIN_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setActiveRole(acc.role);
    setError("");
    performLogin(acc.email, acc.pass);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300,0..1&display=swap');
        @keyframes slideUp {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .login-slide-up { animation: slideUp 0.4s ease-out forwards; }
        input[type="checkbox"] { accent-color: #1D9E75; }
        
        :focus-visible {
          outline: 2px solid #1D9E75;
          outline-offset: 2px;
        }

        .footer-link:hover {
          text-decoration: underline;
        }
      ` }} />

      {/* ── Root wrapper ── */}
      <div
        className={`${plusJakarta.className}`}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#f8f9ff",
          color: "#0b1c30",
          position: "relative",
        }}
      >
        <VantaBackground />

        <div
          className="fixed inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.10) 0%, transparent 60%)," +
              "radial-gradient(ellipse at 70% 50%, rgba(124,58,237,0.08) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        {/* ══════════════════════ NAVBAR ══════════════════════════════════════ */}
        <PublicNavbar />

        {/* ══════════════════════ MAIN CONTENT ROW ════════════════════════════ */}
        <main
          className="flex-1 flex flex-col md:flex-row relative z-10 overflow-y-auto"
          style={{ minHeight: "calc(100vh - 72px)" }}
        >
          {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
          <section
            className="hidden md:flex flex-col justify-center items-stretch p-8 lg:p-12 relative border-r border-emerald-950/10"
            style={{ width: "45%", flexShrink: 0 }}
          >
            <div
              style={{
                maxWidth: "520px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                width: "100%",
              }}
            >
              {/* Live badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-emerald-900/10 backdrop-blur-md shadow-sm self-start"
              >
                <span className="flex h-2 w-2 rounded-full animate-pulse bg-emerald-600" />
                <span className="font-semibold uppercase text-[10px] text-emerald-800 tracking-wider">
                  METTA AI LIVE · 98.7% Accuracy
                </span>
              </div>

              {/* Headline block */}
              <div className="flex flex-col gap-2">
                <h1 className="font-extrabold text-4xl text-slate-900 leading-tight tracking-tight">
                  The World&apos;s First{" "}
                  <span className="text-emerald-600 drop-shadow-sm">
                    AI-Native
                  </span>{" "}
                  EHR
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                  Metta AI works alongside you — documenting encounters, mapping symptoms,
                  predicting outcomes, and writing prescriptions in real time.
                </p>
              </div>

              {/* Feature bento grid */}
              <div className="grid grid-cols-2 gap-3">
                {AI_FEATURES.map(({ icon, label, desc }) => (
                  <div
                    key={label}
                    className="group cursor-default p-4 rounded-xl bg-white/40 border border-white/60 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Icon
                      name={icon}
                      className="text-xl mb-1.5 transition-transform group-hover:scale-110 text-emerald-600"
                    />
                    <h3 className="font-semibold text-xs text-slate-900 mb-0.5 leading-snug">
                      {label}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                {STAT_TOKENS.map(({ value, label }, i) => (
                  <React.Fragment key={label}>
                    {i > 0 && <div className="h-7 w-[1px] bg-slate-200" aria-hidden="true" />}
                    <div className="text-center">
                      <div className="font-extrabold text-xl text-slate-900 tracking-tight">
                        {value}
                      </div>
                      <div className="font-semibold uppercase text-[9px] text-slate-500 tracking-wider">
                        {label}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {/* ── RIGHT PANEL: LOGIN & QUICK ACCESS ───────────────────────────── */}
          <section
            className="flex-1 flex flex-col justify-center items-center p-6 md:p-10 bg-white/80 backdrop-blur-xl border-l border-white/40 shadow-sm overflow-y-auto"
          >
            <div className="login-slide-up w-full max-w-lg flex flex-col gap-6 py-4">

              {/* Header */}
              <div className="text-center md:text-left flex flex-col gap-1">
                <h2 className="font-extrabold text-3xl text-slate-900 tracking-tight">
                  Sign In to Metapharsic EHR
                </h2>
                <p className="text-sm text-slate-600">
                  Select a quick demo role below or enter your system credentials
                </p>
              </div>

              {/* Success alert */}
              {searchParams.get("registered") === "true" && !error && (
                <div
                  role="status"
                  className="flex items-center gap-3 text-sm font-medium p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800"
                >
                  <Icon name="check_circle" className="text-lg text-emerald-600 flex-shrink-0" />
                  Account created successfully! Please sign in.
                </div>
              )}

              {/* Error alert */}
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-3 text-sm font-medium p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800"
                >
                  <Icon name="error" className="text-lg text-red-600 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* ════════════ QUICK LOGIN ACCESSIBLE ROLES GRID ════════════ */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-[11px] text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Icon name="bolt" className="text-sm text-amber-500" />
                    MVP Quick Login Access (6 Roles)
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">1-Click Sign In</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {QUICK_LOGIN_ACCOUNTS.map((acc) => {
                    const isSelected = activeRole === acc.role;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => handleQuickLogin(acc)}
                        disabled={isLoading}
                        className={`group relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150 ${
                          isSelected
                            ? "bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20"
                            : "bg-white/90 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${acc.color}15` }}
                          >
                            <Icon name={acc.icon} className="text-base" style={{ color: acc.color }} />
                          </div>
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                            style={{ backgroundColor: `${acc.color}15`, color: acc.color }}
                          >
                            {acc.role}
                          </span>
                        </div>
                        <div className="font-semibold text-xs text-slate-900 truncate w-full">
                          {acc.title}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate w-full">
                          {acc.email}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center my-1">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase font-medium tracking-wider">
                  or enter credentials
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* ── Standard Form ─────────────────────────────────────────── */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="font-semibold uppercase block text-[10px] text-slate-600 tracking-wider mb-1 ml-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@metapharsic.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 disabled:opacity-60 text-slate-900"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="font-semibold uppercase block text-[10px] text-slate-600 tracking-wider mb-1 ml-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      required
                      disabled={isLoading}
                      className="w-full pl-4 pr-11 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 disabled:opacity-60 text-slate-900"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-lg" />
                    </button>
                  </div>
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between text-xs px-0.5">
                  <label className="flex items-center gap-2 cursor-pointer group select-none text-slate-600">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-slate-300"
                    />
                    <span>Remember device</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit button */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 py-3 px-4 font-semibold text-white flex items-center justify-center gap-2 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    transform: btnPressed ? "scale(0.98)" : undefined,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In to Workspace
                      <Icon name="arrow_forward" className="text-lg" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer info */}
              <div className="text-center flex flex-col gap-2 pt-3 border-t border-slate-200/70">
                <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
                  {["Privacy policy", "Terms of service", "Security architecture"].map((item) => (
                    <Link key={item} href="#" className="hover:underline">
                      {item}
                    </Link>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  Powered by Metta AI &nbsp;&middot;&nbsp; HIPAA Compliant &nbsp;&middot;&nbsp; © 2025 Metapharsic AI
                </p>
              </div>

            </div>
          </section>
        </main>
      </div>
    </>
  );
}
