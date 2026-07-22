"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, User, LogOut } from "lucide-react";
import AuthModal from "./AuthModal";
import { getStoredUser, clearUserSession, UserProfile } from "@/lib/auth";

export default function HeaderNavbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<UserProfile | null>(null);


  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);





  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    clearUserSession();
    setUser(null);
  };

  const isHome = pathname === "/";
  const textClass = isHome && !isScrolled ? "text-white" : "text-foreground";
  const borderClass = isHome && !isScrolled ? "border-white/20" : "border-border";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full h-20 transition-all duration-300 flex items-center ${
          isScrolled
            ? "bg-[#fdf0ec]/95 backdrop-blur-sm border-b border-border shadow-xs"            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="w-full px-8 flex items-center justify-between">
          {/* Left Brand / Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl">🌿</span>
            <span className={`font-serif text-2xl font-medium tracking-tight transition-colors ${textClass}`}>
              Platter<span className="text-muted font-sans text-xs">.ai</span>
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className={`hidden md:flex items-center gap-8 font-inter text-xs tracking-wider uppercase font-medium ${textClass}`}>
            <Link href="/#our-meal-plans" className="hover:opacity-75 transition-opacity">
              Our Meal Plans
            </Link>
            <Link href="/#our-services" className="hover:opacity-75 transition-opacity">
              Our Services
            </Link>
            <Link href="/#why-choose-us" className="hover:opacity-75 transition-opacity">
              Why Choose Us
            </Link>
            <Link href="/#get-in-touch" className="hover:opacity-75 transition-opacity">
              Get In Touch
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">


            {user ? (
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-inter font-medium ${borderClass} ${textClass}`}>
                  <User className="w-3.5 h-3.5" />
                  <span>{user.name || user.email.split("@")[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className={`p-2 border transition-colors ${borderClass} ${textClass} hover:opacity-70`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuth("signin")}
                className={`font-inter text-xs uppercase tracking-wider font-medium hover:opacity-75 transition-opacity hidden sm:block ${textClass}`}
              >
                Sign In
              </button>
            )}

            <Link
              href="/onboarding"
              className={`font-inter font-medium text-xs tracking-widest uppercase px-5 py-2.5 flex items-center gap-2 transition-all ${
                isHome && !isScrolled
                  ? "bg-white text-foreground hover:bg-white/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <span>Generate Plan</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
