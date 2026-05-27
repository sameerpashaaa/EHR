"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Loader2 } from "lucide-react";
import PublicNavbar from "@/components/layout/PublicNavbar";

// Font
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Icon helper
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

// Static left-panel data
const AI_FEATURES = [
  { icon: "psychology",  label: "Neural Symptom Mapper", desc: "Deep pattern recognition across longitudinal patient data." },
  { icon: "description", label: "Auto-Documentation",    desc: "Real-time structured notes generated from ambient audio." },
  { icon: "insights",    label: "Predictive Timeline",   desc: "Visualizing future health trajectories using 4.2B data points." },
  { icon: "bolt",        label: "Ambient Scribe",        desc: "Zero-interaction capture of clinical narratives." },
];

const STAT_TOKENS = [
  { value: "1,284", label: "Active Patients" },
  { value: "24",    label: "AI Notes Today" },
  { value: "<12ms", label: "Inference Speed" },
];

// Vanta background helper
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

export default function SignupPage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hipaaCompliant, setHipaaCompliant] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!name || !email || !organizationName || !role || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    if (!hipaaCompliant) {
      setError("Organization must confirm HIPAA compliance readiness.");
      return;
    }

    setIsLoading(true);
    setError("");
    setBtnPressed(true);
    setTimeout(() => setBtnPressed(false), 120);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          organizationName,
          role,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create workspace.");
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300,0..1&display=swap');
        @keyframes slideUp {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .signup-slide-up { animation: slideUp 0.4s ease-out forwards; }
        input[type="checkbox"] { accent-color: #1D9E75; }
        
        :focus-visible {
          outline: 2px solid #1D9E75;
          outline-offset: 2px;
        }

        .footer-link:hover {
          text-decoration: underline;
        }
      ` }} />

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

        {/* Navbar */}
        <PublicNavbar />

        {/* Main Content */}
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
          {/* LEFT PANEL */}
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

              {/* Headline */}
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
                  Join 12,400+ clinical innovators. Metta AI maps medical timelines, automates SOAP notes, and supports multi-site hospital configurations.
                </p>
              </div>

              {/* Feature grid */}
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

              {/* Stats */}
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

          {/* RIGHT PANEL (Sign Up Form) */}
          <section
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              padding: "24px 40px",
              overflowY: "auto",
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderLeft: "0.5px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "-10px 0 30px rgba(0,0,0,.02)",
            }}
          >
            <div
              className="signup-slide-up w-full my-auto"
              style={{
                maxWidth: "440px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                padding: "20px 0",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h2
                  className="font-extrabold leading-tight text-3xl text-slate-900"
                  style={{ margin: 0 }}
                >
                  Create Workspace
                </h2>
                <p className="text-slate-600 text-sm" style={{ margin: 0 }}>
                  Set up your AI-native clinical environment
                </p>
              </div>

              {/* Error Box */}
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

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }} noValidate>
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="font-semibold uppercase block"
                    style={{ fontSize: "10px", color: "#3c4a42", letterSpacing: "0.06em", marginLeft: "4px", marginBottom: "4px" }}
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Dr. Eleanor Vance"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    required
                    disabled={isLoading}
                    className="w-full rounded-lg outline-none transition-all disabled:opacity-60 py-[10px] px-4 text-[14px] bg-white border border-[#bbcabf] text-[#0b1c30]"
                    style={{ borderRadius: "10px" }}
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

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="font-semibold uppercase block"
                    style={{ fontSize: "10px", color: "#3c4a42", letterSpacing: "0.06em", marginLeft: "4px", marginBottom: "4px" }}
                  >
                    Work Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="evance@clinic.org"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                    disabled={isLoading}
                    className="w-full rounded-lg outline-none transition-all disabled:opacity-60 py-[10px] px-4 text-[14px] bg-white border border-[#bbcabf] text-[#0b1c30]"
                    style={{ borderRadius: "10px" }}
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

                {/* Org Name */}
                <div>
                  <label
                    htmlFor="organizationName"
                    className="font-semibold uppercase block"
                    style={{ fontSize: "10px", color: "#3c4a42", letterSpacing: "0.06em", marginLeft: "4px", marginBottom: "4px" }}
                  >
                    Organization / Hospital Name
                  </label>
                  <input
                    id="organizationName"
                    type="text"
                    placeholder="St. Jude Cardiology Center"
                    value={organizationName}
                    onChange={(e) => { setOrganizationName(e.target.value); setError(""); }}
                    required
                    disabled={isLoading}
                    className="w-full rounded-lg outline-none transition-all disabled:opacity-60 py-[10px] px-4 text-[14px] bg-white border border-[#bbcabf] text-[#0b1c30]"
                    style={{ borderRadius: "10px" }}
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

                {/* Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="font-semibold uppercase block"
                    style={{ fontSize: "10px", color: "#3c4a42", letterSpacing: "0.06em", marginLeft: "4px", marginBottom: "4px" }}
                  >
                    Clinical Role
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => { setRole(e.target.value); setError(""); }}
                      required
                      disabled={isLoading}
                      className="w-full rounded-lg outline-none transition-all disabled:opacity-60 bg-white border border-[#bbcabf] text-[#0b1c30] py-[10px] px-4 text-[14px]"
                      style={{
                        borderRadius: "10px",
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233c4a42' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 16px center",
                        backgroundSize: "16px",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border    = "1px solid #006c49";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,108,73,.10)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border    = "1px solid #bbcabf";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <option value="" disabled>Select your role</option>
                      <option value="Physician">Physician</option>
                      <option value="Nurse Practitioner">Nurse Practitioner</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Password fields row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="font-semibold uppercase block"
                      style={{ fontSize: "10px", color: "#3c4a42", letterSpacing: "0.06em", marginLeft: "4px", marginBottom: "4px" }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        required
                        disabled={isLoading}
                        className="w-full rounded-lg outline-none transition-all disabled:opacity-60 py-[10px] px-4 text-[14px] bg-white border border-[#bbcabf] text-[#0b1c30]"
                        style={{ borderRadius: "10px" }}
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
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                        style={{ color: "#6c7a71" }}
                      >
                        <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[17px]" />
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="font-semibold uppercase block"
                      style={{ fontSize: "10px", color: "#3c4a42", letterSpacing: "0.06em", marginLeft: "4px", marginBottom: "4px" }}
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      required
                      disabled={isLoading}
                      className="w-full rounded-lg outline-none transition-all disabled:opacity-60 py-[10px] px-4 text-[14px] bg-white border border-[#bbcabf] text-[#0b1c30]"
                      style={{ borderRadius: "10px" }}
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

                {/* Checkboxes */}
                <div className="flex flex-col gap-2 mt-2" style={{ padding: "0 2px" }}>
                  <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => { setAgreeTerms(e.target.checked); setError(""); }}
                      disabled={isLoading}
                      className="rounded mt-0.5"
                    />
                    <span
                      className="transition-colors group-hover:opacity-100 opacity-80"
                      style={{ fontSize: "12px", color: "#2a362f", lineHeight: "1.4" }}
                    >
                      I agree to the Terms of Service and Privacy Policy
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      checked={hipaaCompliant}
                      onChange={(e) => { setHipaaCompliant(e.target.checked); setError(""); }}
                      disabled={isLoading}
                      className="rounded mt-0.5"
                    />
                    <span
                      className="transition-colors group-hover:opacity-100 opacity-80"
                      style={{ fontSize: "12px", color: "#2a362f", lineHeight: "1.4" }}
                    >
                      This organization is HIPAA-compliant
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-semibold text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 mt-3"
                  style={{
                    padding: "12px 0",
                    borderRadius: "12px",
                    fontSize: "15px",
                    background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                    borderTop: "1px solid rgba(255,255,255,.40)",
                    boxShadow: "0 4px 15px rgba(16,185,129,.25)",
                    transform: btnPressed ? "scale(0.97)" : undefined,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating Workspace…
                    </>
                  ) : (
                    <>
                      Create Workspace
                      <Icon name="arrow_forward" className="text-[17px]" style={{ color: "#fff" }} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer link to sign in */}
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <p style={{ fontSize: "13px", color: "#6c7a71", margin: 0 }}>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold transition-colors hover:opacity-80"
                    style={{ color: "#006c49" }}
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Footer Legal */}
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                <div className="flex flex-wrap justify-center" style={{ gap: "20px" }}>
                  {["Privacy policy", "Terms of service", "Security architecture"].map((item) => (
                    <Link
                      key={item}
                      href="#"
                      className="footer-link transition-colors opacity-80 hover:opacity-100"
                      style={{ fontSize: "11px", color: "rgba(0,0,0,0.45)" }}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.4)" }}>
                  Powered by Metta AI &nbsp;&middot;&nbsp; HIPAA Compliant
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
