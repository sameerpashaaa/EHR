"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Loader2 } from "lucide-react";
import PublicNavbar from "@/components/layout/PublicNavbar";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setBtnPressed(true);
    setTimeout(() => setBtnPressed(false), 120);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
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

        <PublicNavbar />

        <main
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            zIndex: 10,
            padding: "24px 20px",
          }}
        >
          <div
            className="login-slide-up"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              boxShadow: "0 20px 40px rgba(0,0,0,.05)",
              borderRadius: "24px",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "center" }}>
              <div 
                style={{ 
                  width: "56px", 
                  height: "56px", 
                  borderRadius: "16px", 
                  background: "rgba(16,185,129,0.1)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  margin: "0 auto 12px"
                }}
              >
                <Icon name="key" className="text-[28px]" style={{ color: "#1D9E75" }} />
              </div>
              <h2
                className="font-extrabold leading-tight"
                style={{ fontSize: "28px", color: "#0b1c30", margin: 0 }}
              >
                Forgot Password?
              </h2>
              <p style={{ fontSize: "15px", color: "#3c4a42", margin: 0 }}>
                {!isSubmitted 
                  ? "Enter your email and we'll send you a link to reset your password." 
                  : "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."}
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }} noValidate>
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
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full rounded-lg outline-none transition-all disabled:opacity-60"
                      style={{
                        padding: "12px 16px",
                        fontSize: "15px",
                        background: "#fff",
                        border: "1px solid #bbcabf",
                        color: "#0b1c30",
                        borderRadius: "12px",
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

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full font-semibold text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  style={{
                    padding: "14px 0",
                    borderRadius: "12px",
                    fontSize: "16px",
                    background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                    borderTop: "1px solid rgba(255,255,255,.40)",
                    boxShadow: "0 4px 15px rgba(16,185,129,.25)",
                    transform: btnPressed ? "scale(0.97)" : undefined,
                    marginTop: "8px",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending link…
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <Link
                  href="/login"
                  className="w-full font-semibold text-white flex items-center justify-center gap-2 transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    padding: "14px 0",
                    borderRadius: "12px",
                    fontSize: "16px",
                    background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                    borderTop: "1px solid rgba(255,255,255,.40)",
                    boxShadow: "0 4px 15px rgba(16,185,129,.25)",
                  }}
                >
                  Back to login
                </Link>
              </div>
            )}

            {!isSubmitted && (
              <div className="text-center mt-2">
                <Link
                  href="/login"
                  className="font-medium transition-colors hover:opacity-80 flex items-center justify-center gap-1"
                  style={{ fontSize: "14px", color: "#6c7a71" }}
                >
                  <Icon name="arrow_back" className="text-[16px]" />
                  Back to login
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
