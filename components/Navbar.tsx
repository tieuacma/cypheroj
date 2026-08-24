"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Eye,
  Code2,
  Sparkles,
  User,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  Camera,
  Globe,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { AuthModal } from "./AuthModal";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="border-b border-sky-500/20 bg-background/90 backdrop-blur-md sticky top-0 z-40 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand: Cypher Valorant Agent + Student Academy */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-sky-500 via-cyan-400 to-indigo-600 p-0.5 shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
                <Eye className="w-5 h-5 text-sky-500 group-hover:text-cyan-400 transition-colors animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-widest flex items-center gap-1.5 font-mono">
                CYPHER<span className="text-sky-500">.OJ</span>
                <span className="text-[10px] font-sans font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 hidden sm:inline-block">
                  Agent Academy
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold -mt-1 hidden sm:block">
                {t.nav.subhead}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-2 font-semibold text-sm">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                pathname === "/"
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold border border-sky-500/20 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Camera className="w-4 h-4 text-sky-500" />
              {t.nav.home}
            </Link>

            <Link
              href="/problems"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                pathname.startsWith("/problems") && !pathname.includes("/create")
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold border border-sky-500/20 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Code2 className="w-4 h-4 text-sky-500" />
              {t.nav.problems}
            </Link>

            <Link
              href="/problems/create"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                pathname === "/problems/create"
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold border border-sky-500/20 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t.nav.create}
            </Link>
          </nav>

          {/* Right Control Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bilingual Switcher Toggle */}
            <button
              type="button"
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-xl border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/15 hover:border-sky-500/40 text-xs font-mono font-black text-sky-600 dark:text-sky-400 flex items-center gap-1.5 transition-all shadow-sm"
              title="Switch Language / Chuyển Ngôn ngữ"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === "vi" ? "VI 🇻🇳" : "EN 🇺🇸"}</span>
            </button>

            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-sky-500/30 hover:border-sky-500 bg-sky-500/10 hover:bg-sky-500/20 transition-all text-sm font-semibold shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-linear-to-tr from-sky-400 via-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-inner">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-27.5 truncate font-extrabold text-foreground">
                    {user.name || user.username}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {user.points}đ
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-card border border-sky-500/20 rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1 text-sm font-medium animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-border/50 mb-1">
                      <p className="font-extrabold text-foreground truncate">{user.name}</p>
                      <p className="text-xs font-mono text-muted-foreground truncate">Agent @{user.username}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-sky-500/10 text-foreground hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-semibold"
                    >
                      <User className="w-4 h-4 text-sky-500" />
                      {t.nav.profile}
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors w-full text-left font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="px-3.5 py-2 rounded-xl border border-sky-500/30 hover:border-sky-500 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t.nav.login}
                </button>

                <button
                  onClick={() => openAuth("register")}
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-sky-500 via-cyan-500 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {t.nav.register}
                </button>
              </div>
            )}

            <MobileMenu onOpenAuth={openAuth} />
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
