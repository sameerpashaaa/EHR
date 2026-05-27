"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Activity,
  FileText,
  TrendingUp,
  Mic,
  Pill,
  Share2,
  Building2,
  Stethoscope,
  Video,
  HeartPulse,
  BookOpen,
  PlayCircle,
  FileSpreadsheet,
  Rss,
  VideoIcon,
  HelpCircle,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

// Google Material Symbols Icon component
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

interface DropdownItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
}

export default function PublicNavbar() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<"features" | "solutions" | "learning" | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseEnter = (menu: "features" | "solutions" | "learning") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleDropdown = (menu: "features" | "solutions" | "learning") => {
    if (activeDropdown === menu) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(menu);
    }
  };

  const featureItems: DropdownItem[] = [
    {
      title: "Metta AI Core",
      description: "Real-time clinical intelligence engine.",
      icon: <Brain className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Neural Symptom Mapper",
      description: "Deep pattern recognition across longitudinal data.",
      icon: <Activity className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Auto-Documentation",
      description: "Ambient audio to structured SOAP notes.",
      icon: <FileText className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Predictive Timeline",
      description: "Future health trajectory visualization.",
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Ambient Scribe",
      description: "Zero-interaction clinical narrative capture.",
      icon: <Mic className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Smart Prescriptions",
      description: "AI-assisted writing with drug interaction checks.",
      icon: <Pill className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "EHR Integrations",
      description: "Connect with 24+ existing EHR systems.",
      icon: <Share2 className="w-5 h-5 text-emerald-500" />,
    },
  ];

  const solutionItems: DropdownItem[] = [
    {
      title: "Hospitals",
      description: "Multi-site EHR deployment and fine-tuning.",
      icon: <Building2 className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Private Clinics",
      description: "Streamlined workflow for small practices.",
      icon: <Stethoscope className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Telemedicine Providers",
      description: "Integrated remote consulting and live transcription.",
      icon: <Video className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Specialty Practices",
      description: "Tailored models for Cardiology, Oncology, and more.",
      icon: <HeartPulse className="w-5 h-5 text-emerald-500" />,
    },
  ];

  const learningItems: DropdownItem[] = [
    {
      title: "Documentation",
      description: "Full API and platform integration guides.",
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Video Tutorials",
      description: "Getting started with Metta AI ambient capture.",
      icon: <PlayCircle className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Case Studies",
      description: "Real feedback from 12,400+ clinical users.",
      icon: <FileSpreadsheet className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Blog",
      description: "The latest insights on AI-native healthcare.",
      icon: <Rss className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Webinars",
      description: "Live and recorded clinical AI workshops.",
      icon: <VideoIcon className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: "Help Center",
      description: "Frequently asked questions and support articles.",
      icon: <HelpCircle className="w-5 h-5 text-emerald-500" />,
    },
  ];

  const renderDropdownContent = (items: DropdownItem[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
        {items.map((item) => (
          <Link
            key={item.title}
            href="/login"
            className="flex items-start gap-3 p-2.5 rounded-lg transition-colors hover:bg-emerald-500/10 group"
            onClick={() => setActiveDropdown(null)}
          >
            <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-md bg-emerald-500/5 group-hover:bg-emerald-500/20 transition-colors">
              {item.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <>
      <nav
        ref={dropdownRef}
        aria-label="Main navigation"
        className="relative z-[150] h-[72px] min-h-[72px] max-h-[72px] flex items-center justify-between px-6 md:px-9 bg-white/20 backdrop-blur-xl border-b border-white/10 flex-shrink-0"
      >
        {/* Logo */}
        <Link href="/login" className="flex items-center gap-2 cursor-pointer group">
          <div
            className="flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "9px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: "0 0 12px rgba(16,185,129,.30),0 0 24px rgba(16,185,129,.10)",
              flexShrink: 0,
            }}
          >
            <Icon name="local_hospital" className="text-[18px]" style={{ color: "#fff" }} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Metapharsic
          </span>
        </Link>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center justify-center gap-2">
          {/* Features Menu Button */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("features")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => toggleDropdown("features")}
              className={`flex items-center gap-1 transition-all duration-200 hover:bg-black/5 hover:-translate-y-0.5 text-[15px] font-medium px-3.5 py-2 rounded-full ${
                activeDropdown === "features" ? "bg-black/5 text-emerald-600" : "text-slate-700"
              }`}
            >
              Features
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                activeDropdown === "features" ? "rotate-180 text-emerald-600" : ""
              }`} />
            </button>

            {/* Features Dropdown Menu */}
            <AnimatePresence>
              {activeDropdown === "features" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[520px] bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-2xl overflow-hidden z-[200]"
                >
                  {renderDropdownContent(featureItems)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Solutions Menu Button */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("solutions")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => toggleDropdown("solutions")}
              className={`flex items-center gap-1 transition-all duration-200 hover:bg-black/5 hover:-translate-y-0.5 text-[15px] font-medium px-3.5 py-2 rounded-full ${
                activeDropdown === "solutions" ? "bg-black/5 text-emerald-600" : "text-slate-700"
              }`}
            >
              Solutions
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                activeDropdown === "solutions" ? "rotate-180 text-emerald-600" : ""
              }`} />
            </button>

            {/* Solutions Dropdown Menu */}
            <AnimatePresence>
              {activeDropdown === "solutions" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[480px] bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-2xl overflow-hidden z-[200]"
                >
                  {renderDropdownContent(solutionItems)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Plans/Pricing Link */}
          <Link
            href="/plans"
            className="flex items-center gap-1 transition-all duration-200 hover:bg-black/5 hover:-translate-y-0.5 text-[15px] font-medium px-3.5 py-2 rounded-full text-slate-700 hover:text-slate-900"
          >
            Plans
          </Link>

          {/* Learning Menu Button */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("learning")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => toggleDropdown("learning")}
              className={`flex items-center gap-1 transition-all duration-200 hover:bg-black/5 hover:-translate-y-0.5 text-[15px] font-medium px-3.5 py-2 rounded-full ${
                activeDropdown === "learning" ? "bg-black/5 text-emerald-600" : "text-slate-700"
              }`}
            >
              Learning
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                activeDropdown === "learning" ? "rotate-180 text-emerald-600" : ""
              }`} />
            </button>

            {/* Learning Dropdown Menu */}
            <AnimatePresence>
              {activeDropdown === "learning" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[520px] bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-2xl overflow-hidden z-[200]"
                >
                  {renderDropdownContent(learningItems)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center justify-end gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            style={{ background: "#1D9E75" }}
            className="text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#0F6E56] transition-colors shadow-sm"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-800 focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full bg-white border-b border-slate-200 z-[140] overflow-hidden"
          >
            <div className="flex flex-col p-5 gap-4">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Features</span>
                {featureItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.title}
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-slate-700 hover:text-emerald-600 py-1.5 flex items-center gap-2"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Solutions</span>
                {solutionItems.map((item) => (
                  <Link
                    key={item.title}
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-slate-700 hover:text-emerald-600 py-1.5"
                  >
                    Solutions for {item.title}
                  </Link>
                ))}
              </div>

              <Link
                href="/plans"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-800 hover:text-emerald-600 py-1"
              >
                Pricing Plans
              </Link>

              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Learning</span>
                {learningItems.slice(0, 3).map((item) => (
                  <Link
                    key={item.title}
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-slate-700 hover:text-emerald-600 py-1.5"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ background: "#1D9E75" }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
