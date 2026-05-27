"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Check, ArrowRight, ShieldCheck, Zap, Activity } from "lucide-react";
import PublicNavbar from "@/components/layout/PublicNavbar";

// Font
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

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

export default function PlansPage() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "Ideal for solo practitioners launching their digital clinical workspace.",
      features: [
        "1 clinician seat",
        "Basic auto-documentation (SOAP)",
        "50 patients / month limit",
        "Community support channel",
        "Standard HIPAA safety protocols",
      ],
      cta: "Get Started",
      href: "/signup",
      popular: false,
    },
    {
      name: "Professional",
      price: "$149",
      period: "per month / clinician",
      description: "For active clinicians and growing practices requiring full clinical intelligence.",
      features: [
        "Unlimited patient records",
        "Full Metta AI Suite (timeline, mapper, scribe)",
        "5 EHR integrations included",
        "Priority clinician support (email/chat)",
        "Advanced drug interaction helper",
        "Full database encryption",
      ],
      cta: "Get Started",
      href: "/signup",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For hospitals, multi-site practices, and telehealth organizations.",
      features: [
        "Multi-site deployment capabilities",
        "All integrations (24+ systems)",
        "Dedicated AI model fine-tuning",
        "HIPAA BAA + compliance reporting",
        "24/7 dedicated telephone support",
        "Custom service level agreements (SLAs)",
      ],
      cta: "Contact Sales",
      href: "/signup",
      popular: false,
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      ` }} />

      <div
        className={`${plusJakarta.className}`}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#f8f9ff",
          color: "#0b1c30",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        <VantaBackground />

        {/* Ambient Glows */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 30%, rgba(16,185,129,0.08) 0%, transparent 60%)," +
              "radial-gradient(ellipse at 70% 70%, rgba(124,58,237,0.06) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        {/* Navbar */}
        <PublicNavbar />

        {/* Main Content Area */}
        <main className="relative z-10 flex-grow flex flex-col items-center px-6 py-12 md:py-20 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="text-center max-w-3xl mb-12 md:mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              HIPAA Compliant Cloud Solutions
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Transparent Pricing for <br className="hidden sm:inline" />
              <span className="text-[#006c49]">AI-Native Healthcare</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed">
              Empower your practice with Metta AI ambient scribe, neural symptom mapping, and deep EHR integrations. Select a tier tailored to your organizational scale.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch animate-fade-in [animation-delay:150ms]">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
                  plan.popular
                    ? "bg-white/80 border-2 border-emerald-500 shadow-xl md:scale-[1.04] z-10"
                    : "bg-white/35 border border-white/40 shadow-md"
                }`}
                style={{
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <span
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1"
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    }}
                  >
                    <Zap className="w-3 h-3 fill-white" />
                    Most Popular
                  </span>
                )}

                {/* Card Title */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mt-2 min-h-[40px] leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-1 border-b border-slate-200/50 pb-6">
                  <span className="text-4xl md:text-5xl font-extrabold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    /{plan.period}
                  </span>
                </div>

                {/* Feature List */}
                <ul className="mt-8 space-y-4 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <div className="flex-shrink-0 mt-0.5 p-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="leading-normal">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="mt-8 pt-4">
                  <Link
                    href={plan.href}
                    style={{
                      background: plan.popular
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        : "rgba(16, 185, 129, 0.1)",
                    }}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-center text-sm flex items-center justify-center gap-2 transition-all duration-150 ${
                      plan.popular
                        ? "text-white hover:bg-emerald-600 shadow-md hover:shadow-emerald-500/20"
                        : "text-[#006c49] hover:bg-emerald-500/20"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof Stats */}
          <div
            className="w-full max-w-4xl bg-white/40 border border-white/50 backdrop-blur-md rounded-3xl p-6 md:p-8 mt-16 md:mt-24 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left animate-fade-in [animation-delay:300ms]"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl flex-shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Reliable AI Inference Platform</h4>
                <p className="text-slate-500 text-xs mt-1">98.7% accurate auto-documentation with zero-latency SLA agreements.</p>
              </div>
            </div>
            <div className="h-px md:h-12 w-full md:w-px bg-slate-200/50" />
            <div>
              <div className="text-2xl font-extrabold text-slate-900">12,400+</div>
              <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider mt-0.5">Clinicians Trust Us</div>
            </div>
            <div className="h-px md:h-12 w-full md:w-px bg-slate-200/50" />
            <div>
              <div className="text-2xl font-extrabold text-slate-900">24+</div>
              <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider mt-0.5">EHR Integrations</div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
