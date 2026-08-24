"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useTheme, ThemeMode } from "@/lib/theme-provider";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/20 bg-card text-muted-foreground opacity-60"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  const options: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: "light", label: "Sáng (Light)", icon: Sun },
    { mode: "dark", label: "Tối (Dark)", icon: Moon },
    { mode: "system", label: "Hệ thống (System)", icon: Laptop },
  ];

  const currentIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;
  const IconComponent = currentIcon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/15 hover:border-sky-500/40 text-sky-600 dark:text-sky-400 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        aria-label="Selection Theme / Chọn giao diện"
        title={`Chủ đề: ${theme === "light" ? "Sáng" : theme === "dark" ? "Tối" : "Theo hệ thống"}`}
      >
        <motion.div
          key={theme + resolvedTheme}
          initial={{ scale: 0.7, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <IconComponent className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 rounded-2xl border border-sky-500/20 bg-card p-1.5 shadow-xl z-50 text-xs font-semibold backdrop-blur-md"
          >
            <div className="px-2 py-1 text-[10px] uppercase font-mono tracking-wider text-muted-foreground border-b border-border/50 mb-1">
              Giao diện / Theme
            </div>
            {options.map((opt) => {
              const OptIcon = opt.icon;
              const isSelected = theme === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => {
                    setTheme(opt.mode);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <OptIcon className="h-3.5 w-3.5 text-sky-500" />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-sky-500" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

