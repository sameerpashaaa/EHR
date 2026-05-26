"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Loader2 } from "lucide-react";

// ─── Font ────────────────────────────────────────────────────────────────────
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// ─── Material Symbols icon (module-level, no hooks) ──────────────────────────
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

// ─── Static data ─────────────────────────────────────────────────────────────
const AI_FEATURES = [
  { icon: "psychology",  label: "Neural Symptom Mapper", desc: "Deep pattern recognition across longitudinal patient data." },
  { icon: "description", label: "Auto-Documentation",    desc: "Real-time structured notes generated from ambient audio." },
  { icon: "insights",    label: "Predictive Timeline",   desc: "Visualizing future health trajectories using 4.2B data points." },
  { icon: "bolt",        label: "Ambient Scribe",        desc: "Zero-interaction capture of clinical narratives." },
];

const DEMO_CREDS = [
  { role: "Admin",     email: "admin@metapharsic.com",     pass: "admin123" },
  { role: "Physician", email: "physician@metapharsic.com", pass: "physician123" },
  { role: "Nurse",     email: "nurse@metapharsic.com",     pass: "nurse123" },
];

const STAT_TOKENS = [
  { value: "1,284", label: "Active Patients" },
  { value: "24",    label: "AI Notes Today" },
  { value: "<12ms", label: "Inference Speed" },
];

// ─── Vanta animated background ───────────────────────────────────────────────
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
          console.log("Vanta CELLS initialized successfully.");
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
        // In case it finished loading between our check and event listener
        if (W.VANTA?.CELLS) tryInit();
        return;
      }

      vantaScript = document.createElement("script");
      vantaScript.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.cells.min.js";
      vantaScript.onload = tryInit;
      vantaScript.onerror = (e) => console.error("Failed to load Vanta cells script:", e);
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
      threeScript.onerror = (e) => console.error("Failed to load Three.js script:", e);
      document.head.appendChild(threeScript);
    };

    loadThree();

    return () => {
      isCleanedUp = true;
      if (vantaEffect.current) {
        vantaEffect.current.destroy?.();
        vantaEffect.current = null;
      }
      if (threeScript) {
        threeScript.remove();
      }
      if (vantaScript) {
        vantaScript.remove();
      }
    };
  }, []);

  return <div ref={vantaRef} className="fixed inset-0 z-0" aria-hidden="true" />;
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") || "/";

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState("");
  const [btnPressed,   setBtnPressed]   = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    setError("");
    setBtnPressed(true);
    setTimeout(() => setBtnPressed(false), 120);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Fill demo credentials ───────────────────────────────────────────────────
  const fillDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError("");
    setShowDemoMenu(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────
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

        .signup-btn {
          background: #1D9E75;
          color: #ffffff;
          padding: 9px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          transition: background 0.15s ease;
        }
        .signup-btn:hover {
          background: #0F6E56;
        }
      ` }} />

      {/* ── Root wrapper ── */}
      <div
        className={`${plusJakarta.className}`}
        style={{
          height: "100vh",
          overflow: "hidden",
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
        <nav
          aria-label="Main navigation"
          style={{
            position: "relative",
            zIndex: 100,
            height: "72px",
            minHeight: "72px",
            maxHeight: "72px",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            paddingLeft: "36px",
            paddingRight: "36px",
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(12px)",
            borderBottom: "0.5px solid rgba(255, 255, 255, 0.15)",
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div
              className="flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                boxShadow: "0 0 12px rgba(16,185,129,.30),0 0 24px rgba(16,185,129,.10)",
                flexShrink: 0,
              }}
            >
              <Icon name="local_hospital" className="text-[18px]" style={{ color: "#fff" }} />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ color: "#0b1c30" }}>
              Metapharsic
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center justify-center gap-3">
            {["Features", "Solutions", "Plans", "Learning"].map((item) => (
              <button
                key={item}
                className="flex items-center gap-1 transition-all duration-200 hover:bg-black/5 hover:-translate-y-0.5"
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  padding: "8px 14px",
                  borderRadius: "999px",
                  color: "#3c4a42",
                }}
              >
                {item}
                {(item === "Features" || item === "Learning") && (
                  <Icon name="expand_more" className="text-[15px]" />
                )}
              </button>
            ))}
          </div>

          {/* Sign Up CTA */}
          <div className="flex items-center justify-end" style={{ marginLeft: "24px" }}>
            <button className="signup-btn">
              Sign Up
            </button>
          </div>
        </nav>

        {/* ══════════════════════ MAIN CONTENT ROW ════════════════════════════ */}
        <main
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
          <section
            className="hidden md:flex"
            style={{
              width: "50%",
              flexShrink: 0,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "stretch",
              padding: "32px 44px",
              overflow: "hidden",
              borderRight: "1px solid rgba(187,202,191,.30)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "120px",
                background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4) 100%)",
                zIndex: 15,
                pointerEvents: "none",
              }}
              aria-hidden="true"
            />

            <div
              style={{
                position: "relative",
                zIndex: 20,
                maxWidth: "520px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                width: "100%",
                paddingBottom: "20px",
              }}
            >
              {/* Live badge */}
              <div
                className="inline-flex items-center gap-2"
                style={{
                  padding: "5px 12px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,.60)",
                  border: "1px solid rgba(187,202,191,.30)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 4px rgba(0,0,0,.05)",
                  alignSelf: "flex-start",
                }}
              >
                <span
                  className="flex h-2 w-2 rounded-full animate-pulse"
                  style={{ background: "#006c49" }}
                />
                <span
                  className="font-semibold uppercase"
                  style={{ fontSize: "10px", color: "#006c49", letterSpacing: "0.06em" }}
                >
                  METTA AI LIVE · 98.7% Accuracy
                </span>
              </div>

              {/* Headline block */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h1
                  className="font-extrabold leading-tight"
                  style={{ fontSize: "40px", color: "#0b1c30", letterSpacing: "-0.02em", margin: 0 }}
                >
                  The World&apos;s First{" "}
                  <span
                    style={{
                      color: "#006c49",
                      filter: "drop-shadow(0 0 15px rgba(16,185,129,.20))",
                    }}
                  >
                    AI-Native
                  </span>{" "}
                  EHR
                </h1>
                <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#3c4a42", margin: 0, maxWidth: "460px" }}>
                  Metta AI works alongside you — documenting encounters, mapping symptoms,
                  predicting outcomes, and writing prescriptions in real time.
                </p>
              </div>

              {/* Feature bento grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "11px",
                }}
              >
                {AI_FEATURES.map(({ icon, label, desc }) => (
                  <div
                    key={label}
                    className="group cursor-default transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg"
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.12)",
                      border: "0.5px solid rgba(255, 255, 255, 0.25)",
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <Icon
                      name={icon}
                      className="text-[22px] transition-transform group-hover:scale-110"
                      style={{ color: "#1D9E75" }}
                    />
                    <h3
                      className="font-semibold"
                      style={{ fontSize: "14px", color: "rgba(255,255,255,0.95)", fontWeight: 500, margin: 0, lineHeight: "1.3" }}
                    >
                      {label}
                    </h3>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", margin: 0, lineHeight: "1.5" }}>
                      {desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div
                className="flex items-center justify-between"
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(187,202,191,.30)",
                }}
              >
                {STAT_TOKENS.map(({ value, label }, i) => (
                  <React.Fragment key={label}>
                    {i > 0 && (
                      <div
                        style={{ height: "28px", width: "1px", background: "rgba(187,202,191,.50)" }}
                        aria-hidden="true"
                      />
                    )}
                    <div className="text-center">
                      <div
                        className="font-extrabold"
                        style={{ fontSize: "24px", color: "#0b1c30", letterSpacing: "-0.01em" }}
                      >
                        {value}
                      </div>
                      <div
                        className="font-semibold uppercase"
                        style={{ fontSize: "10px", color: "#3c4a42", letterSpacing: "0.06em" }}
                      >
                        {label}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
          <section
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "24px 40px",
              overflow: "hidden",
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderLeft: "0.5px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "-10px 0 30px rgba(0,0,0,.02)",
            }}
          >
            {/* Form card */}
            <div
              className="login-slide-up"
              style={{
                width: "100%",
                maxWidth: "420px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h2
                  className="font-extrabold leading-tight"
                  style={{ fontSize: "30px", color: "#0b1c30", margin: 0 }}
                >
                  Welcome back
                </h2>
                <p style={{ fontSize: "15px", color: "#3c4a42", margin: 0 }}>
                  Sign in to your clinical workspace
                </p>
              </div>

              {/* Error alert */}
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-3 text-sm font-medium"
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "#ffdad6",
                    border: "1px solid rgba(186,26,26,.25)",
                    color: "#93000a",
                  }}
                >
                  <Icon name="error" className="text-[17px] flex-shrink-0" style={{ color: "#93000a" }} />
                  {error}
                </div>
              )}

              {/* ── Form ─────────────────────────────────────────────────── */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }} noValidate>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="font-semibold uppercase block"
                    style={{ fontSize: "10px", color: "#3c4a42", letterSpacing: "0.06em", marginLeft: "4px", marginBottom: "5px" }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@metapharsic.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      required
                      disabled={isLoading}
                      className="w-full rounded-lg outline-none transition-all disabled:opacity-60"
                      style={{
                        padding: "11px 16px",
                        fontSize: "15px",
                        background: "#fff",
                        border: "1px solid #bbcabf",
                        color: "#0b1c30",
                        borderRadius: "10px",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border    = "1px solid #006c49";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,108,73,.10)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border    = "1px solid #bbcabf";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="font-semibold uppercase block"
                    style={{ fontSize: "10px", color: "#3c4a42", letterSpacing: "0.06em", marginLeft: "4px", marginBottom: "5px" }}
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
                      className="w-full rounded-lg outline-none transition-all disabled:opacity-60"
                      style={{
                        padding: "11px 44px 11px 16px",
                        fontSize: "15px",
                        background: "#fff",
                        border: "1px solid #bbcabf",
                        color: "#0b1c30",
                        borderRadius: "10px",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border    = "1px solid #006c49";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,108,73,.10)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border    = "1px solid #bbcabf";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-150 hover:opacity-100 opacity-60"
                      style={{ color: "#6c7a71" }}
                    >
                      <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[18px]" />
                    </button>
                  </div>
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between" style={{ padding: "0 2px" }}>
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded"
                    />
                    <span
                      className="transition-colors group-hover:opacity-100 opacity-80"
                      style={{ fontSize: "13px", color: "#2a362f" }}
                    >
                      Remember device
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="font-medium transition-colors hover:opacity-80"
                    style={{ fontSize: "13px", color: "#006c49" }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Social proof */}
                <div 
                  className="flex items-center justify-center gap-3 mt-2 pt-4"
                  style={{ borderTop: "1px solid rgba(187,202,191,0.4)" }}
                >
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center"
                        style={{ zIndex: 4 - i }}
                      >
                        <span className="text-[9px] font-bold text-emerald-800">
                          {["JD", "AS", "MK"][i-1]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span
                    className="font-medium"
                    style={{ fontSize: "13px", color: "var(--text-secondary, #6c7a71)" }}
                  >
                    Trusted by 12,400+ clinicians
                  </span>
                </div>

                {/* Submit button */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-semibold text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  style={{
                    padding: "13px 0",
                    borderRadius: "12px",
                    fontSize: "16px",
                    background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                    borderTop: "1px solid rgba(255,255,255,.40)",
                    boxShadow: "0 4px 15px rgba(16,185,129,.25)",
                    transform: btnPressed ? "scale(0.97)" : undefined,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in to Workspace
                      <Icon name="arrow_forward" className="text-[17px]" style={{ color: "#fff" }} />
                    </>
                  )}
                </button>
              </form>

              {/* Demo credentials */}
              <div style={{ position: "relative", width: "100%", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className="w-full rounded-lg transition-colors hover:bg-black/5"
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    border: "1px dashed rgba(187,202,191,0.8)",
                    color: "#3c4a42",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  Try demo account
                </button>
                {showDemoMenu && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: 0,
                      right: 0,
                      marginBottom: "8px",
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid #bbcabf",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      borderRadius: "8px",
                      padding: "8px",
                      zIndex: 10,
                    }}
                  >
                    <div
                      style={{
                        paddingBottom: "6px",
                        marginBottom: "4px",
                        borderBottom: "1px solid rgba(187,202,191,.50)",
                        color: "#6c7a71",
                        fontSize: "11px",
                        textAlign: "center",
                      }}
                    >
                      Select Role
                    </div>
                    {DEMO_CREDS.map(({ role, email: e, pass }) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => fillDemo(e, pass)}
                        className="w-full text-left rounded hover:bg-black/5 transition-colors"
                        style={{ color: "#3c4a42", padding: "6px 12px", fontSize: "13px" }}
                      >
                        <span className="font-semibold">{role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                <div className="flex flex-wrap justify-center" style={{ gap: "20px" }}>
                  {["Privacy policy", "Terms of service", "Security architecture"].map((item) => (
                    <Link
                      key={item}
                      href="#"
                      className="footer-link transition-colors opacity-80 hover:opacity-100"
                      style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
                
                <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.4)" }}>
                  Powered by Metta AI &nbsp;&middot;&nbsp; HIPAA Compliant
                </div>
                
                <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)", margin: 0 }}>
                  © 2025 Metapharsic AI. HIPAA Compliant.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
