"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ShieldAlert, CheckCircle2, Lock, X, Clock, AlertTriangle, Eye, EyeOff } from "lucide-react";

interface AdminKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (verifiedKey: string) => void;
  title?: string;
  description?: string;
}

export function AdminKeyModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Xác thực Quyền Chỉnh Sửa Bài Tập",
  description = "Bài tập này được bảo vệ bởi Admin. Bạn vui lòng nhập đúng Key Admin để tiếp tục.",
}: AdminKeyModalProps) {
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  // Check current IP ban status on modal open
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/admin/verify-key")
      .then((res) => res.json())
      .then((data) => {
        if (data.banned) {
          setIsBanned(true);
          setRemainingSeconds(data.remainingSeconds || 0);
          setFailedCount(data.failed_count || 0);
          setError(
            `IP thiết bị của bạn đang bị cấm do nhập sai Admin Key liên tiếp. Vui lòng thử lại sau.`
          );
        } else {
          setIsBanned(false);
          setFailedCount(data.failed_count || 0);
          if (data.failed_count > 0 && data.failed_count < 5) {
            setRemainingAttempts(5 - data.failed_count);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to check IP ban status", err);
      });
  }, [isOpen]);

  // Live countdown timer if banned
  useEffect(() => {
    if (!isBanned || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsBanned(false);
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBanned, remainingSeconds]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        onSuccess(adminKey);
        onClose();
        setAdminKey("");
      } else {
        setError(data.message || "Key Admin không chính xác.");
        if (data.banned) {
          setIsBanned(true);
          setRemainingSeconds(data.remainingSeconds || 3600);
          setFailedCount(data.failed_count || 5);
        } else {
          setFailedCount(data.failed_count || 0);
          setRemainingAttempts(data.remainingAttempts);
        }
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setError("Đã xảy ra lỗi khi kiểm tra Admin Key.");
    }
  };

  const formatTimer = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
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

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-md bg-background border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl z-50 text-foreground overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight leading-tight">
                {title}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-medium">
            {description}
          </p>

          {/* Banned Alert Banner */}
          {isBanned && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-400 mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-extrabold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 animate-bounce" />
                <span>CẢNH BÁO: IP THIẾT BỊ ĐÃ BỊ CẤM</span>
              </div>
              <p className="text-xs leading-relaxed font-semibold">
                Do nhập sai Key Admin {failedCount} lần liên tiếp. IP thiết bị của bạn bị cấm trong{" "}
                <strong className="font-mono text-rose-500">
                  {Math.pow(2, Math.max(0, failedCount - 5))} giờ
                </strong>.
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs font-mono font-black bg-background/80 px-3 py-2 rounded-xl border border-rose-500/20 w-fit">
                <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                <span>Thời gian cấm còn lại: {formatTimer(remainingSeconds)}</span>
              </div>
            </div>
          )}

          {/* Warning Banner for Remaining Attempts */}
          {!isBanned && error && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex flex-col gap-1 mb-5">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              {remainingAttempts !== undefined && (
                <span className="text-[11px] text-amber-500 font-mono font-bold pl-6">
                  ⚠️ Nhập sai 5 lần sẽ bị cấm IP 1 giờ (1h × 2^k).
                </span>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-muted-foreground flex items-center justify-between">
                <span>Key Admin</span>
                <span className="text-[10px] text-amber-500 font-mono">Bảo mật bắt buộc</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type={isKeyVisible ? "text" : "password"}
                  required
                  disabled={isBanned || isSubmitting}
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Nhập Admin Key..."
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-amber-500/30 bg-muted/20 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 text-sm font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setIsKeyVisible((visible) => !visible)}
                  disabled={isBanned || isSubmitting}
                  aria-label={isKeyVisible ? "Ẩn Admin Key" : "Hiện Admin Key"}
                  className="absolute right-3 top-2.5 p-1 text-muted-foreground hover:text-amber-500 transition-colors disabled:opacity-50"
                >
                  {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-border text-foreground font-bold text-xs hover:bg-muted transition-all"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isBanned || isSubmitting || !adminKey.trim()}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  "Đang xác thực..."
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Xác nhận
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
