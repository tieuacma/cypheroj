"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Terminal, Shield } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg border border-cypher-border text-foreground hover:border-cypher-cyan hover:text-cypher-cyan transition-all"
        aria-label="Open menu"
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
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-cypher-surface border-l border-cypher-border z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-cypher-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cypher-cyan/10 border border-cypher-cyan flex items-center justify-center">
                      <Terminal className="w-4.5 h-4.5 text-cypher-cyan" />
                    </div>
                    <span className="text-lg font-black tracking-widest">
                      CYPHER<span className="text-cypher-cyan">.OJ</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg border border-cypher-border text-foreground hover:border-cypher-error hover:text-cypher-error transition-all"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-cypher-border hover:border-cypher-cyan hover:bg-cypher-cyan/5 transition-all group"
                      >
                        <Terminal className="w-5 h-5 text-cypher-muted group-hover:text-cypher-cyan transition-colors" />
                        <span className="font-semibold">Trang chủ</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/problems"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-cypher-cyan bg-cypher-cyan/5 transition-all group"
                      >
                        <Shield className="w-5 h-5 text-cypher-cyan" />
                        <span className="font-semibold text-cypher-cyan">Kho bài tập</span>
                      </Link>
                    </li>
                  </ul>
                </nav>

                {/* Footer with Theme Toggle */}
                <div className="p-4 border-t border-cypher-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cypher-muted">Giao diện</span>
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
