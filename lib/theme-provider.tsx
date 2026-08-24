"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
export type Theme = ThemeMode; // Alias for backward compatibility
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "cypher-oj-theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") {
    return getSystemTheme();
  }
  return mode;
}

function applyThemeClass(resolved: ResolvedTheme) {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const activeMode: ThemeMode = stored && ["light", "dark", "system"].includes(stored) ? stored : "system";
    const resolved = resolveTheme(activeMode);

    applyThemeClass(resolved);
    setThemeState(activeMode);
    setResolvedTheme(resolved);
    setMounted(true);
  }, []);

  // Listen to OS system color scheme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const nextResolved = getSystemTheme();
      applyThemeClass(nextResolved);
      setResolvedTheme(nextResolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    const nextResolved = resolveTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyThemeClass(nextResolved);
    setThemeState(newTheme);
    setResolvedTheme(nextResolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      // Cycle: light -> dark -> system -> light
      let next: ThemeMode = "dark";
      if (prev === "dark") next = "light";
      else if (prev === "light") next = "system";
      else next = "dark";

      const nextResolved = resolveTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
      applyThemeClass(nextResolved);
      setResolvedTheme(nextResolved);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

