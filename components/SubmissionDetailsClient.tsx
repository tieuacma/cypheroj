"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Code,
  ChevronLeft,
  Calendar,
  FileCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Filter,
  User,
} from "lucide-react";
import type { TestcaseDetail, TestcaseVerdict } from "@/lib/types";
import type { DbSubmission } from "@/lib/db/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CodeEditor } from "@/components/CodeEditor";
import { Navbar } from "@/components/Navbar";
import { CypherVoicelineWidget } from "@/components/CypherVoicelineWidget";

interface SubmissionDetailsClientProps {
  id: string; // Numeric ID from Supabase
}

type StatusIcon = React.ComponentType<{ className?: string }>;

const VERDICT_STYLES: Record<string, { bg: string; text: string; icon: StatusIcon; border: string }> = {
  Pending: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    border: "border-zinc-500/20",
    icon: Loader2,
  },
  Running: {
    bg: "bg-cypher-cyan/10 border-cypher-cyan/40",
    text: "text-cypher-cyan animate-pulse",
    border: "border-cypher-cyan/30",
    icon: Loader2,
  },
  Accepted: {
    bg: "bg-green-500/10",
    text: "text-green-500",
    border: "border-green-500/30",
    icon: CheckCircle,
  },
  "Wrong Answer": {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/30",
    icon: XCircle,
  },
  "Compilation Error": {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/30",
    icon: AlertCircle,
  },
  "Runtime Error": {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/30",
    icon: AlertCircle,
  },
  "Time Limit Exceeded": {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/30",
    icon: AlertCircle,
  },
};

function determineVerdict(sub: DbSubmission): string {
  if (sub.status === "pending") return "Pending";
  if (sub.status === "processing") return "Running";
  if (sub.status === "internal_error") return "Runtime Error";

  if (sub.error_log && sub.error_log.trim().length > 0) {
    if (
      sub.error_log.toLowerCase().includes("compile") ||
      sub.error_log.toLowerCase().includes("compilation") ||
      sub.error_log.toLowerCase().includes("error: ")
    ) {
      return "Compilation Error";
    }
    return "Runtime Error";
  }

  if (sub.details && sub.details.length > 0) {
    const failed = sub.details.find((d) => d.status !== "ac");
    if (failed) {
      if (failed.status === "wa") return "Wrong Answer";
      if (failed.status === "tle") return "Time Limit Exceeded";
      if (failed.status === "re") return "Runtime Error";
      if (failed.status === "ce") return "Compilation Error";
      return "Wrong Answer";
    }
    return "Accepted";
  }

  if (sub.earned_points === sub.total_points && sub.total_points > 0) {
    return "Accepted";
  }
  return "Wrong Answer";
}

const POLL_TIMEOUT_MS = 10000;
const RELOAD_COOLDOWN_MS = 15000;
const LS_LAST_POLL_KEY = "cypheroj_last_poll_timestamp";

type FilterStatus = "all" | "ac" | "failed";

export function SubmissionDetailsClient({ id }: SubmissionDetailsClientProps) {
  const [submission, setSubmission] = useState<DbSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestcase, setSelectedTestcase] = useState<TestcaseDetail | null>(null);
  const [showSlowMachineWarning, setShowSlowMachineWarning] = useState(false);
  const [isPollingStopped, setIsPollingStopped] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [copiedCode, setCopiedCode] = useState(false);

  const [cooldownRemaining, setCooldownRemaining] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const lastPoll = localStorage.getItem(LS_LAST_POLL_KEY);
    if (!lastPoll) return 0;
    const elapsed = Date.now() - parseInt(lastPoll, 10);
    if (elapsed >= RELOAD_COOLDOWN_MS) return 0;
    return Math.ceil((RELOAD_COOLDOWN_MS - elapsed) / 1000);
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRegradeRef = useRef(false);

  const triggerRegrade = async () => {
    try {
      const response = await fetch(`/api/submissions/${id}/regrade`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to trigger regrade:", response.status, errorData);
      } else {
        console.log("Regrade triggered successfully");
      }
    } catch (err) {
      console.error("Error triggering regrade:", err);
    }
  };

  const fetchSubmission = async (silent = false) => {
    try {
      const response = await fetch(`/api/submissions/${id}`);
      if (!response.ok) {
        throw new Error("Không thể tải thông tin lượt nộp bài.");
      }
      const data = (await response.json()) as DbSubmission;
      setSubmission(data);
      if (!silent) setIsLoading(false);

      if (data.status === "completed" || data.status === "internal_error") {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setShowSlowMachineWarning(false);
        setIsPollingStopped(false);
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
        setIsLoading(false);
      }
    }
  };

  const cleanupTimers = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const lastPoll = localStorage.getItem(LS_LAST_POLL_KEY);
    const now = Date.now();
    let delayStartMs = 0;

    if (lastPoll) {
      const elapsed = now - parseInt(lastPoll, 10);
      if (elapsed < RELOAD_COOLDOWN_MS) {
        delayStartMs = RELOAD_COOLDOWN_MS - elapsed;
      }
    }

    if (delayStartMs > 0) {
      cooldownIntervalRef.current = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);

      const cooldownTimer = setTimeout(() => {
        setCooldownRemaining(0);
        startPolling();
      }, delayStartMs);

      return () => {
        clearTimeout(cooldownTimer);
        cleanupTimers();
      };
    } else {
      startPolling();
    }

    function startPolling() {
      queueMicrotask(() => {
        void fetchSubmission();
      });

      pollIntervalRef.current = setInterval(() => {
        void fetchSubmission(true);
      }, 1500);

      timeoutRef.current = setTimeout(() => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        localStorage.setItem(LS_LAST_POLL_KEY, String(Date.now()));
        setShowSlowMachineWarning(true);
        setIsPollingStopped(true);

        if (!hasTriggeredRegradeRef.current) {
          hasTriggeredRegradeRef.current = true;
          void triggerRegrade();
        }
      }, POLL_TIMEOUT_MS);
    }

    return () => {
      cleanupTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCopyCode = async () => {
    if (!submission?.source_code) return;
    await navigator.clipboard.writeText(submission.source_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-cypher-muted font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cypher-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(14,165,233,0.4)]" />
          <span className="text-sm font-bold tracking-widest text-shimmer">
            DECRYPTING SUBMISSION REPORT #{id}...
          </span>
          {cooldownRemaining > 0 && (
            <span className="text-xs text-amber-500 font-bold">
              Đang chờ cooldown... {cooldownRemaining}s
            </span>
          )}
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-red-500 font-mono p-4 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md glass-panel p-8 rounded-2xl border border-red-500/30">
          <AlertCircle className="w-12 h-12 text-red-500 animate-bounce" />
          <span className="text-sm font-bold">LỖI TRUY XUẤT LƯỢT NỘP #{id}: {error || "Không tìm thấy dữ liệu."}</span>
          <Link
            href="/problems"
            className="mt-2 px-6 py-2.5 rounded-xl bg-cypher-cyan text-zinc-950 font-black text-xs uppercase tracking-wider hover:bg-cypher-cyan/90 transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]"
          >
            Quay lại Kho bài tập
          </Link>
        </div>
      </div>
    );
  }

  const verdict = determineVerdict(submission);
  const verdictConfig = VERDICT_STYLES[verdict] || VERDICT_STYLES["Pending"];
  const StatusIcon = verdictConfig.icon;

  const mappedTestcases: TestcaseDetail[] = submission.details
    ? submission.details.map((d, index) => ({
        index: d.testcase_index ?? (index + 1),
        status: (d.status?.toLowerCase() as TestcaseVerdict) || "pending",
        timeTaken: d.time_ms,
        memoryTaken: d.memory_mb,
        input: "",
        expectedOutput: "",
        userOutput: d.message || "",
      }))
    : Array.from({ length: 10 }, (_, i) => ({
        index: i + 1,
        status: submission.status === "processing" ? ("running" as const) : ("pending" as const),
      }));

  const runnedTestcases = mappedTestcases.filter(
    (t) => t.status !== "pending" && t.status !== "running"
  );

  let maxTime = submission.max_time_ms ?? 0;
  const totalTime = runnedTestcases.reduce((sum, t) => sum + (t.timeTaken || 0), 0);
  let maxMemory = submission.max_memory_mb ?? 0;
  const totalMemory = runnedTestcases.reduce((sum, t) => sum + (t.memoryTaken || 0), 0);

  if (runnedTestcases.length > 0 && maxTime === 0) {
    maxTime = Math.max(...runnedTestcases.map((t) => t.timeTaken || 0));
  }
  if (runnedTestcases.length > 0 && maxMemory === 0) {
    maxMemory = Math.max(...runnedTestcases.map((t) => t.memoryTaken || 0));
  }

  const formatTime = (ms: number) => (ms / 1000).toFixed(3) + "s";
  const formatMemory = (mb: number) => mb.toFixed(1) + " MB";

  const verdictShortForm: Record<string, string> = {
    Accepted: "AC",
    "Wrong Answer": "WA",
    "Time Limit Exceeded": "TLE",
    "Runtime Error": "RE",
    "Compilation Error": "CE",
    Pending: "PENDING",
    Running: "RUNNING",
  };

  const shortVerdict = verdictShortForm[verdict] || verdict;
  const isEvalDone = submission.status === "completed" || submission.status === "internal_error";
  const showScore = isEvalDone && verdict !== "Compilation Error" && verdict !== "Runtime Error";
  const formattedTimestamp = new Date(submission.created_at).toLocaleString();

  // Filtered testcases
  const filteredTestcases = mappedTestcases.filter((t) => {
    if (filterStatus === "ac") return t.status === "ac";
    if (filterStatus === "failed") return t.status !== "ac" && t.status !== "pending" && t.status !== "running";
    return true;
  });

  const getVoicelineType = () => {
    if (verdict === "Accepted") return "accepted";
    if (verdict === "Wrong Answer") return "wrongAnswer";
    if (verdict === "Time Limit Exceeded") return "timeLimit";
    if (verdict === "Compilation Error") return "compilationError";
    return "compiling";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground selection:bg-sky-500/20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <CypherVoicelineWidget type={getVoicelineType()} />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Submission Meta Panel */}
        <div className="cyber-panel p-6 rounded-2xl border-l-4 border-l-cypher-cyan bg-cypher-surface/20 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase text-foreground leading-snug">
                Lượt nộp bài bài tập{" "}
                <Link
                  href={`/problems/${submission.problem_id}`}
                  className="text-cypher-cyan hover:underline font-mono"
                >
                  #{submission.problem_id}
                </Link>
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-cypher-muted">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cypher-cyan" /> Agent_Candidate
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formattedTimestamp}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-cypher-cyan font-bold">
                  <FileCode className="w-3.5 h-3.5" /> {submission.language === "cpp" ? "C++17 (GCC)" : submission.language.toUpperCase()}
                </span>
                <span>•</span>
                <span>ID: #{submission.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verdict & Details Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Verdict Display */}
          <div
            className={`cyber-panel p-6 rounded-2xl flex flex-col justify-center items-center text-center gap-3 ${verdictConfig.bg} ${verdictConfig.border} border shadow-lg ${
              showSlowMachineWarning ? "md:col-span-1" : ""
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center bg-background border ${verdictConfig.border} shadow-[0_0_15px_rgba(0,0,0,0.1)]`}
            >
              <StatusIcon
                className={`w-8 h-8 ${verdict === "Running" || verdict === "Pending" ? "animate-spin" : ""}`}
              />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-cypher-muted font-bold">
                Kết quả thực thi
              </div>
              <h3 className={`text-3xl font-black uppercase mt-1 tracking-tight ${verdictConfig.text}`}>
                {shortVerdict}
              </h3>
              {showScore && (
                <div className="text-sm font-bold font-mono text-cypher-cyan mt-1">
                  Score: {submission.earned_points}/{submission.total_points}đ
                </div>
              )}
            </div>
          </div>

          {/* Slow Machine Warning Panel */}
          {showSlowMachineWarning && (
            <div className="md:col-span-2 cyber-panel p-6 rounded-2xl bg-amber-500/10 border-amber-500/30 border flex flex-col gap-3 shadow-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-amber-500">
                    {isPollingStopped ? "Đã dừng gửi request tự động" : "Hệ thống phản hồi chậm"}
                  </h4>
                  <p className="text-xs text-amber-400/90 mt-1 leading-relaxed">
                    {isPollingStopped
                      ? "Request quá 10 giây. Vui lòng reload lại trang để cập nhật kết quả mới nhất (chờ 5 giây giữa các lần reload)."
                      : "Máy chấm phản hồi chậm. Kết quả sẽ tự động cập nhật lại."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Compiler / Error Logs */}
          <div className={`cyber-panel p-6 rounded-2xl bg-cypher-surface flex flex-col gap-3 shadow-sm ${showSlowMachineWarning ? "md:col-span-3" : "md:col-span-2"}`}>
            <h4 className="text-xs font-black uppercase tracking-widest text-cypher-cyan border-b border-cypher-border pb-2 flex items-center justify-between">
              <span>Compiler console / Nhật ký hệ thống</span>
              <Zap className="w-3.5 h-3.5" />
            </h4>
            <div className="flex-grow bg-zinc-100 dark:bg-zinc-950/90 rounded-xl border border-cypher-border p-4 font-mono text-xs text-zinc-800 dark:text-zinc-300 overflow-y-auto max-h-[140px] min-h-[100px] leading-relaxed">
              {verdict === "Pending" && (
                <div className="flex items-center gap-2 text-cypher-cyan animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xếp hàng chờ máy chấm thực thi...</span>
                </div>
              )}
              {verdict === "Running" && (
                <div className="flex items-center gap-2 text-cypher-cyan animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Máy chấm đang chạy bài giải qua các testcase...</span>
                </div>
              )}
              {verdict !== "Pending" && verdict !== "Running" && (
                <pre className="whitespace-pre-wrap text-red-400 font-mono text-xs">
                  {submission.error_log || "Không có lỗi biên dịch. Chương trình đã thực thi thành công."}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Testcase Evaluation Matrix */}
        <div className="cyber-panel p-6 rounded-2xl flex flex-col gap-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-cypher-cyan">
                Testcases Evaluation Matrix
              </h4>
              <p className="text-xs text-cypher-muted mt-0.5">
                Bấm vào từng testcase để kiểm tra thời gian thực thi và chi tiết kết quả.
              </p>
            </div>

            {/* Testcase Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-background border border-cypher-border rounded-xl text-xs font-semibold">
              <span className="text-cypher-muted px-2 flex items-center gap-1 text-[11px]">
                <Filter className="w-3 h-3" /> Lọc:
              </span>
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterStatus === "all" ? "bg-cypher-cyan text-zinc-950 font-bold" : "text-cypher-muted hover:text-foreground"
                }`}
              >
                Tất cả ({mappedTestcases.length})
              </button>
              <button
                onClick={() => setFilterStatus("ac")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterStatus === "ac" ? "bg-green-500 text-zinc-950 font-bold" : "text-cypher-muted hover:text-foreground"
                }`}
              >
                AC ({mappedTestcases.filter((t) => t.status === "ac").length})
              </button>
              <button
                onClick={() => setFilterStatus("failed")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterStatus === "failed" ? "bg-red-500 text-white font-bold" : "text-cypher-muted hover:text-foreground"
                }`}
              >
                Failed ({mappedTestcases.filter((t) => t.status !== "ac" && t.status !== "pending" && t.status !== "running").length})
              </button>
            </div>
          </div>

          {/* Testcases List */}
          <div className="flex flex-col gap-2">
            {filteredTestcases.map((t, idx) => {
              let rowClass = "bg-zinc-800/10 border-cypher-border text-zinc-500 hover:bg-zinc-800/20";
              let badgeClass = "bg-zinc-800/20 text-zinc-500 border-cypher-border/20";
              let badgeText = "PENDING";

              if (t.status === "ac") {
                rowClass = "bg-green-500/5 border-green-500/10 text-green-500 hover:bg-green-500/10 hover:border-green-500/30";
                badgeClass = "bg-green-500/10 text-green-500 border-green-500/20";
                badgeText = "AC (PASSED)";
              } else if (t.status === "wa") {
                rowClass = "bg-red-500/5 border-red-500/10 text-red-500 hover:bg-red-500/10 hover:border-red-500/30";
                badgeClass = "bg-red-500/10 text-red-500 border-red-500/20";
                badgeText = "WA (WRONG)";
              } else if (t.status === "tle") {
                rowClass = "bg-amber-500/5 border-amber-500/10 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30";
                badgeClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                badgeText = "TLE (TIME)";
              } else if (t.status === "re") {
                rowClass = "bg-red-500/5 border-red-500/10 text-red-500 hover:bg-red-500/10 hover:border-red-500/30";
                badgeClass = "bg-red-500/10 text-red-500 border-red-500/20";
                badgeText = "RE (RUNTIME)";
              } else if (t.status === "ce") {
                rowClass = "bg-red-500/5 border-red-500/10 text-red-500 hover:bg-red-500/10 hover:border-red-500/30";
                badgeClass = "bg-red-500/10 text-red-500 border-red-500/20";
                badgeText = "CE (COMPILE)";
              } else if (t.status === "running") {
                rowClass = "border-cypher-cyan/40 bg-cypher-cyan/10 text-cypher-cyan animate-pulse";
                badgeClass = "bg-cypher-cyan/20 text-cypher-cyan border-cypher-cyan/30";
                badgeText = "RUNNING";
              }

              const isSelected = selectedTestcase?.index === t.index;
              const isInteractable = t.status !== "pending" && t.status !== "running";

              return (
                <button
                  key={idx}
                  onClick={() => isInteractable && setSelectedTestcase(t)}
                  disabled={!isInteractable}
                  className={`w-full flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${rowClass} ${
                    isSelected
                      ? "ring-2 ring-cypher-cyan scale-[1.01] shadow-[0_0_12px_rgba(14,165,233,0.2)]"
                      : ""
                  } disabled:cursor-not-allowed text-left gap-2`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-cypher-muted">
                      #{String(t.index).padStart(2, "0")}
                    </span>
                    <span className="font-bold text-foreground">Test Case {t.index}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-black tracking-wider ${badgeClass}`}
                    >
                      {badgeText}
                    </span>

                    <div className="flex items-center gap-4 text-xs font-mono text-cypher-muted min-w-[150px] justify-end">
                      <span title="Thời gian chạy">
                        {t.timeTaken !== undefined ? formatTime(t.timeTaken) : "-"}
                      </span>
                      <span className="text-cypher-border/50">|</span>
                      <span title="Bộ nhớ sử dụng">
                        {t.memoryTaken !== undefined ? formatMemory(t.memoryTaken) : "-"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Resource Usage Meter Summary */}
          {runnedTestcases.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 p-5 rounded-xl border border-cypher-border bg-cypher-surface/40">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono text-cypher-muted tracking-wider">
                  Thời gian lớn nhất
                </span>
                <span className="text-lg font-black text-foreground font-mono mt-1">{formatTime(maxTime)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono text-cypher-muted tracking-wider">
                  Tổng thời gian
                </span>
                <span className="text-lg font-black text-foreground font-mono mt-1">{formatTime(totalTime)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono text-cypher-muted tracking-wider">
                  Bộ nhớ lớn nhất
                </span>
                <span className="text-lg font-black text-foreground font-mono mt-1">{formatMemory(maxMemory)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono text-cypher-muted tracking-wider">
                  Tổng bộ nhớ
                </span>
                <span className="text-lg font-black text-foreground font-mono mt-1">{formatMemory(totalMemory)}</span>
              </div>
            </div>
          )}

          {/* Testcase Details Inspector Drawer */}
          <AnimatePresence mode="wait">
            {selectedTestcase ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="cyber-panel p-5 rounded-xl bg-cypher-surface/60 border border-cypher-border flex flex-col gap-4 mt-2 shadow-lg"
              >
                <div className="flex justify-between items-center border-b border-cypher-border pb-2">
                  <span className="text-sm font-bold text-cypher-cyan font-mono">
                    INSPECTOR: Testcase #{selectedTestcase.index}
                  </span>
                  <div className="flex items-center gap-4 text-xs font-mono text-cypher-muted">
                    {selectedTestcase.timeTaken !== undefined && (
                      <span>
                        Thời gian: <strong className="text-foreground">{formatTime(selectedTestcase.timeTaken)}</strong>
                      </span>
                    )}
                    {selectedTestcase.memoryTaken !== undefined && (
                      <span>
                        Bộ nhớ: <strong className="text-foreground">{formatMemory(selectedTestcase.memoryTaken)}</strong>
                      </span>
                    )}
                    <button onClick={() => setSelectedTestcase(null)} className="text-red-500 font-bold ml-2">
                      ✕ Đóng
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col justify-center gap-1.5 p-4 rounded-lg bg-background border border-cypher-border">
                    <span className="text-[10px] font-bold text-cypher-muted font-mono uppercase">Log / Kết quả thực thi</span>
                    <pre className="whitespace-pre-wrap font-mono text-xs text-foreground mt-1">
                      {selectedTestcase.userOutput || "Không ghi nhận log lỗi cho testcase này."}
                    </pre>
                  </div>

                  <div className="flex flex-col justify-center gap-1.5 p-4 rounded-lg bg-background border border-cypher-border">
                    <span className="text-[10px] font-bold text-cypher-muted font-mono uppercase">Trạng thái so khớp</span>
                    <span
                      className={`text-xs font-bold ${selectedTestcase.status === "ac" ? "text-green-500" : "text-red-500"}`}
                    >
                      {selectedTestcase.status === "ac"
                        ? "✓ Testcase passed successfully."
                        : `✗ Testcase failed. Trạng thái: ${selectedTestcase.status.toUpperCase()}`}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Source Code Section */}
        <div className="cyber-panel p-6 rounded-2xl flex flex-col gap-4 bg-cypher-surface/20 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black uppercase tracking-wider text-cypher-cyan flex items-center gap-2">
              <Code className="w-4 h-4" />
              Submitted Source Code
            </h4>

            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cypher-border hover:border-cypher-cyan text-xs font-bold text-cypher-muted hover:text-cypher-cyan transition-colors bg-cypher-surface"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? "Đã chép" : "Sao chép mã zdroj"}
            </button>
          </div>

          <div className="rounded-xl border border-cypher-border overflow-hidden">
            <CodeEditor
              value={submission.source_code}
              onChange={() => {}}
              defaultCode={submission.source_code}
              readOnly={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
