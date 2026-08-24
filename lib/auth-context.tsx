"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { SafeUser } from "@/lib/models/user";

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    name: string;
    school?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; school?: string; bio?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Đăng nhập thất bại." };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Đã xảy ra lỗi kết nối.",
      };
    }
  };

  const register = async (input: {
    username: string;
    email: string;
    password: string;
    name: string;
    school?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Đăng ký thất bại." };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Đã xảy ra lỗi kết nối.",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data: { name?: string; school?: string; bio?: string; avatar?: string }) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Cập nhật hồ sơ thất bại." };
      }
      setUser(resData.user);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Đã xảy ra lỗi kết nối.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
