"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, Lock, Mail, User, School, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [regSchool, setRegSchool] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(usernameOrEmail, password);
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Đăng nhập thất bại.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await register({
      username: regUsername,
      email: regEmail,
      name: regName,
      school: regSchool,
      password: regPassword,
    });
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Đăng ký thất bại.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-md bg-card border border-sky-500/20 rounded-3xl p-6 md:p-8 shadow-2xl z-50 text-foreground overflow-hidden"
        >
          {/* Top Decorative Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight">
                {mode === "login" ? "Đăng Nhập Học Sinh" : "Đăng Ký Tài Khoản Mới"}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-muted/60 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-card text-sky-500 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Đăng nhập
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-card text-sky-500 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Đăng ký
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Username hoặc Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="ví dụ: hocsinh1 hoặc email@gmail.com"
                    className="w-full pl-10 pr-4 theme-input"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-4 theme-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-extrabold text-sm hover:opacity-95 shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập ngay"}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Username</label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="hocsinh123"
                    className="w-full px-3 py-2 theme-input text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Họ và Tên</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 theme-input text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="hocsinh@gmail.com"
                    className="w-full pl-9 pr-3 py-2 theme-input text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Trường / Lớp</label>
                <div className="relative">
                  <School className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    placeholder="THPT Chuyên Hà Nội"
                    className="w-full pl-9 pr-3 py-2 theme-input text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full pl-9 pr-3 py-2 theme-input text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-extrabold text-sm hover:opacity-95 shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
              >
                {isLoading ? "Đang khởi tạo tài khoản..." : "Hoàn tất đăng ký"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
