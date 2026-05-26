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
    let threeLoaded = false;
    let vantaLoaded = false;

    const tryInit = () => {
      if (!threeLoaded || !vantaLoaded) return;
      if (vantaEffect.current) return;
      const W    = window as unknown as Record<string, unknown>;
      const VANTA = W["VANTA"] as { CELLS?: (opts: unknown) => { destroy?: () => void } } | undefined;
      if (VANTA?.CELLS && vantaRef.current) {
        vantaEffect.current = VANTA.CELLS({
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
      }
    };

    const addScript = (src: string, onLoad: () => void) => {
      const s = document.createElement("script");
      s.src    = src;
      s.onload = onLoad;
      document.head.appendChild(s);
      return s;
    };

    const threeScript = addScript(
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js",
      () => { threeLoaded = true; tryInit(); }
    );
    const vantaScript = addScript(
      "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.cells.min.js",
      () => { vantaLoaded = true; tryInit(); }
    );

    return () => {
      vantaEffect.current?.destroy?.();
      threeScript.remove();
      vantaScript.remove();
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
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Material Symbols font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300,0..1&display=swap');
        @keyframes slideUp {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .login-slide-up { animation: slideUp 0.4s ease-out forwards; }
        input[type="checkbox"] { accent-color: #006c49; }
      `}</style>

      <div
        className={`${plusJakarta.className} min-h-screen relative`}
        style={{ background: "#f8f9ff", color: "#0b1c30" }}
      >
        {/* Animated cells background */}
        <VantaBackground />

        {/* Radial gradient overlay */}
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
          className="fixed top-0 left-0 right-0 z-[100] bg-transparent py-6 px-10 grid grid-cols-3 items-center"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer justify-self-start group">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                boxShadow: "0 0 12px rgba(16,185,129,.30),0 0 24px rgba(16,185,129,.10)",
              }}
            >
              <Icon name="local_hospital" className="text-[20px]" style={{ color: "#fff" }} />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ color: "#0b1c30" }}>
              Metapharsic
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center justify-center gap-4">
            {["Features", "Solutions", "Plans", "Learning"].map((item) => (
              <button
                key={item}
                className="px-5 py-2 rounded-full flex items-center gap-1 font-semibold text-sm transition-all duration-200 hover:bg-white/60 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,.40)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,.20)",
                  color: "#0f172a",
                }}
              >
                {item}
                {(item === "Features" || item === "Learning") && (
                  <Icon name="expand_more" className="text-[18px]" />
                )}
              </button>
            ))}
          </div>

          {/* Sign Up */}
          <div className="flex items-center justify-self-end">
            <button
              className="px-6 py-2 rounded-full font-bold text-sm text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "rgba(20,184,166,.80)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,.30)",
                boxShadow: "0 4px 6px rgba(0,0,0,.10)",
              }}
            >
              Sign Up
            </button>
          </div>
        </nav>

        {/* ══════════════════════ MAIN ════════════════════════════════════════ */}
        <main className="flex flex-col md:flex-row min-h-screen w-full relative z-10 mt-24">

          {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
          <section
            className="hidden md:flex md:w-1/2 relative flex-col justify-center px-10 py-12 z-10"
            style={{ borderRight: "1px solid rgba(187,202,191,.30)" }}
          >
            <div className="relative z-20 max-w-2xl mx-auto space-y-10">

              {/* Live badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,.60)",
                  border: "1px solid rgba(187,202,191,.30)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 4px rgba(0,0,0,.05)",
                }}
              >
                <span
                  className="flex h-2 w-2 rounded-full animate-pulse"
                  style={{ background: "#006c49" }}
                />
                <span
                  className="text-[11px] font-semibold uppercase"
                  style={{ color: "#006c49", letterSpacing: "0.06em" }}
                >
                  METTA AI LIVE · 98.7% Accuracy
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-6">
                <h1
                  className="font-extrabold leading-tight"
                  style={{ fontSize: "48px", color: "#0b1c30", letterSpacing: "-0.02em" }}
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
                <p className="text-[18px] leading-relaxed max-w-xl" style={{ color: "#3c4a42" }}>
                  Metta AI works alongside you — documenting encounters, mapping symptoms,
                  predicting outcomes, and writing prescriptions in real time.
                </p>
              </div>

              {/* Feature bento grid */}
              <div className="grid grid-cols-2 gap-4">
                {AI_FEATURES.map(({ icon, label, desc }) => (
                  <div
                    key={label}
                    className="p-6 rounded-xl transition-all duration-300 cursor-default group hover:-translate-y-[2px] hover:shadow-lg"
                    style={{
                      background: "rgba(255,255,255,.40)",
                      backdropFilter: "blur(24px)",
                      border: "1px solid rgba(255,255,255,.80)",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,.05),0 2px 4px -1px rgba(0,0,0,.03)",
                    }}
                  >
                    <Icon
                      name={icon}
                      className="text-[28px] mb-3 block transition-transform group-hover:scale-110"
                      style={{ color: "#006c49" }}
                    />
                    <h3 className="text-[20px] font-semibold mb-1" style={{ color: "#0b1c30" }}>
                      {label}
                    </h3>
                    <p className="text-[14px]" style={{ color: "#3c4a42" }}>
                      {desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div
                className="flex items-center justify-between pt-8"
                style={{ borderTop: "1px solid rgba(187,202,191,.30)" }}
              >
                {STAT_TOKENS.map(({ value, label }, i) => (
                  <React.Fragment key={label}>
                    {i > 0 && (
                      <div
                        className="h-8 w-px"
                        style={{ background: "rgba(187,202,191,.50)" }}
                        aria-hidden="true"
                      />
                    )}
                    <div className="text-center">
                      <div
                        className="font-extrabold"
                        style={{ fontSize: "32px", color: "#0b1c30", letterSpacing: "-0.01em" }}
                      >
                        {value}
                      </div>
                      <div
                        className="font-semibold uppercase"
                        style={{ fontSize: "11px", color: "#3c4a42", letterSpacing: "0.06em" }}
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
            className="flex-1 flex flex-col justify-between items-center p-8 md:p-16"
            style={{
              background: "rgba(255,255,255,.70)",
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(255,255,255,.40)",
              boxShadow: "-10px 0 30px rgba(0,0,0,.02)",
            }}
          >
            {/* Form card */}
            <div className="w-full max-w-md space-y-8 py-12 login-slide-up">

              {/* Header */}
              <div className="space-y-2 text-center md:text-left">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                  style={{ background: "#e5eeff", border: "1px solid rgba(108,122,113,.20)" }}
                >
                  <Icon name="verified_user" className="text-sm" style={{ color: "#006c49" }} />
                  <span
                    className="font-semibold uppercase"
                    style={{ fontSize: "11px", color: "#3c4a42", letterSpacing: "0.06em" }}
                  >
                    Powered by Metta AI
                  </span>
                </div>
                <h2 className="font-extrabold leading-tight" style={{ fontSize: "36px", color: "#0b1c30" }}>
                  Welcome back
                </h2>
                <p className="text-[18px]" style={{ color: "#3c4a42" }}>
                  Sign in to your clinical workspace
                </p>
              </div>

              {/* Error alert */}
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium"
                  style={{
                    background: "#ffdad6",
                    border: "1px solid rgba(186,26,26,.25)",
                    color: "#93000a",
                  }}
                >
                  <Icon name="error" className="text-[18px] flex-shrink-0" style={{ color: "#93000a" }} />
                  {error}
                </div>
              )}

              {/* ── Form ─────────────────────────────────────────────────── */}
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-4">

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="font-semibold uppercase block ml-4 mb-1.5"
                      style={{ fontSize: "11px", color: "#3c4a42", letterSpacing: "0.06em" }}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Icon
                        name="mail"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none"
                        style={{ color: "#6c7a71" }}
                      />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@metapharsic.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        required
                        disabled={isLoading}
                        className="w-full rounded-lg px-12 py-3.5 outline-none transition-all text-[16px] disabled:opacity-60"
                        style={{ background: "#fff", border: "1px solid #bbcabf", color: "#0b1c30" }}
                        onFocus={(e) => {
                          e.currentTarget.style.border    = "1px solid #006c49";
                          e.currentTarget.style.boxShadow = "0 0 0 4px rgba(0,108,73,.10)";
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
                      className="font-semibold uppercase block ml-4 mb-1.5"
                      style={{ fontSize: "11px", color: "#3c4a42", letterSpacing: "0.06em" }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Icon
                        name="lock"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none"
                        style={{ color: "#6c7a71" }}
                      />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        required
                        disabled={isLoading}
                        className="w-full rounded-lg px-12 py-3.5 outline-none transition-all text-[16px] disabled:opacity-60"
                        style={{ background: "#fff", border: "1px solid #bbcabf", color: "#0b1c30" }}
                        onFocus={(e) => {
                          e.currentTarget.style.border    = "1px solid #006c49";
                          e.currentTarget.style.boxShadow = "0 0 0 4px rgba(0,108,73,.10)";
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
                        <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[20px]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded"
                    />
                    <span
                      className="text-[14px] transition-colors group-hover:opacity-100 opacity-80"
                      style={{ color: "#3c4a42" }}
                    >
                      Remember device
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[14px] font-medium transition-colors hover:opacity-80"
                    style={{ color: "#006c49" }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Social proof */}
                <p className="text-center text-[14px] font-medium" style={{ color: "#3c4a42" }}>
                  Join 12,400+ clinicians
                </p>

                {/* Submit button */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-semibold text-[18px] text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  style={{
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
                      <Icon name="arrow_forward" className="text-[18px]" style={{ color: "#fff" }} />
                    </>
                  )}
                </button>
              </form>

              {/* Demo credentials panel */}
              <div
                className="rounded-xl overflow-hidden font-mono text-sm space-y-2 p-4"
                style={{
                  background: "rgba(255,255,255,.80)",
                  border: "1px solid #bbcabf",
                  boxShadow: "0 2px 4px rgba(0,0,0,.04)",
                }}
              >
                <div
                  className="flex items-center justify-between pb-2 text-xs"
                  style={{ borderBottom: "1px solid rgba(187,202,191,.50)", color: "#6c7a71" }}
                >
                  <span>// DEMO CREDENTIALS</span>
                  <Icon name="info" className="text-[14px]" style={{ color: "#6c7a71" }} />
                </div>
                {DEMO_CREDS.map(({ role, email: e, pass }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => fillDemo(e, pass)}
                    className="w-full flex justify-between items-center transition-colors duration-150 text-left px-1 py-0.5 rounded hover:opacity-100 opacity-70"
                    style={{ color: "#3c4a42" }}
                    title={`Fill ${role} credentials`}
                  >
                    <span className="font-semibold">{role}</span>
                    <span className="text-[12px]" style={{ color: "#6c7a71" }}>{e}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <footer className="w-full text-center space-y-4 pb-4">
              <p className="text-[14px] flex items-center justify-center gap-2" style={{ color: "#3c4a42" }}>
                <Icon name="security" className="text-[16px]" style={{ color: "#3c4a42" }} />
                Protected by HIPAA-compliant security · Unauthorized access is prohibited
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {["Privacy Policy", "Terms of Service", "Security Architecture"].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="transition-colors hover:opacity-100 opacity-70"
                    style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#3c4a42" }}
                  >
                    {item}
                  </Link>
                ))}
              </div>
              <p
                style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: "#6c7a71" }}
              >
                © 2024 Metapharsic AI. HIPAA Compliant Enterprise Grade Security.
              </p>
            </footer>
          </section>
        </main>
      </div>
    </>
  );
}
