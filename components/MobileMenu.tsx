"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, Code2, Sparkles, User, LogIn, UserPlus, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth-context";

interface MobileMenuProps {
  onOpenAuth?: (mode: "login" | "register") => void;
}

export function MobileMenu({ onOpenAuth }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden inline-flex items-center justify-center p-2.5 rounded-xl border border-sky-500/20 text-foreground hover:border-sky-500 hover:text-sky-500 transition-all bg-background"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
              aria-hidden="true"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-card border-l border-sky-500/20 z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-base font-extrabold tracking-tight">
                      CYPHER<span className="text-sky-500">.ACADEMY</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl border border-border text-foreground hover:border-rose-500 hover:text-rose-500 transition-all"
                    aria-label="Close menu"
                    aria-expanded={isOpen}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Header if Logged In */}
                {user && (
                  <div className="p-4 bg-sky-500/5 border-b border-sky-500/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-extrabold text-sm truncate">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">@{user.username} • {user.points}đ</span>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 p-4 overflow-y-auto">
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all group font-semibold text-sm ${
                          pathname === "/"
                            ? "border-sky-500/30 bg-sky-500/5 text-sky-600 dark:text-sky-400"
                            : "border-border hover:border-sky-500 hover:bg-sky-500/5"
                        }`}
                        aria-current={pathname === "/" ? "page" : undefined}
                      >
                        <GraduationCap className="w-5 h-5 text-muted-foreground group-hover:text-sky-500 transition-colors" />
                        <span>Trang chủ</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/problems"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all group font-semibold text-sm ${
                          pathname.startsWith("/problems") && !pathname.includes("/create")
                            ? "border-sky-500/30 bg-sky-500/5 text-sky-600 dark:text-sky-400"
                            : "border-border hover:border-sky-500 hover:bg-sky-500/5"
                        }`}
                        aria-current={pathname.startsWith("/problems") && !pathname.includes("/create") ? "page" : undefined}
                      >
                        <Code2 className="w-5 h-5 text-sky-500" />
                        <span>Kho bài tập</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/problems/create"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all group font-semibold text-sm ${
                          pathname === "/problems/create"
                            ? "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                            : "border-border hover:border-amber-500 hover:bg-amber-500/5"
                        }`}
                        aria-current={pathname === "/problems/create" ? "page" : undefined}
                      >
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <span>Tạo bài tập mới</span>
                      </Link>
                    </li>

                    {user && (
                      <li>
                        <Link
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border hover:border-sky-500 hover:bg-sky-500/5 transition-all group font-semibold text-sm"
                        >
                          <User className="w-5 h-5 text-sky-500" />
                          <span>Hồ sơ cá nhân</span>
                        </Link>
                      </li>
                    )}
                  </ul>

                  {!user && onOpenAuth && (
                    <div className="mt-6 flex flex-col gap-2.5">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onOpenAuth("login");
                        }}
                        className="w-full py-3 rounded-2xl border border-sky-500/30 text-sky-600 dark:text-sky-400 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Đăng nhập
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onOpenAuth("register");
                        }}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-sky-500/20"
                      >
                        <UserPlus className="w-4 h-4" /> Đăng ký học sinh
                      </button>
                    </div>
                  )}
                </nav>

                {/* Footer with Theme Toggle & Logout */}
                <div className="p-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold">Chủ đề giao diện</span>
                  <div className="flex items-center gap-2">
                    {user && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          logout();
                        }}
                        className="p-2 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-all"
                        title="Đăng xuất"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
