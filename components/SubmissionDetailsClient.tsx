"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Code, ChevronLeft, Calendar, FileCode, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { TestcaseDetail, TestcaseVerdict } from "@/lib/types";
import type { DbSubmission } from "@/lib/db/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CodeEditor } from "@/components/CodeEditor";

interface SubmissionDetailsClientProps {
  id: string; // This will be the numeric ID from Supabase
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

export function SubmissionDetailsClient({ id }: SubmissionDetailsClientProps) {
  const [submission, setSubmission] = useState<DbSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestcase, setSelectedTestcase] = useState<TestcaseDetail | null>(null);
  const [showSlowMachineWarning, setShowSlowMachineWarning] = useState(false);
  const [isPollingStopped, setIsPollingStopped] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(() => {
    // Compute initial cooldown from localStorage (lazy init)
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

      // Stop polling if status is terminal
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

  // Cleanup helper for all timers
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
    // Check reload cooldown from localStorage
    const lastPoll = localStorage.getItem(LS_LAST_POLL_KEY);
    const now = Date.now();
    let delayStartMs = 0;

    if (lastPoll) {
      const elapsed = now - parseInt(lastPoll, 10);
      if (elapsed < RELOAD_COOLDOWN_MS) {
        delayStartMs = RELOAD_COOLDOWN_MS - elapsed;
      }
    }

    // If cooldown is active, wait before starting
    if (delayStartMs > 0) {
      // Show countdown
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
      // Initial fetch
      queueMicrotask(() => {
        void fetchSubmission();
      });

      // Start polling every 1.5s
      pollIntervalRef.current = setInterval(() => {
        void fetchSubmission(true);
      }, 1500);

      // After 10 seconds, STOP all polling requests
      timeoutRef.current = setTimeout(() => {
        // Stop polling completely
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        // Save timestamp to localStorage for reload cooldown
        localStorage.setItem(LS_LAST_POLL_KEY, String(Date.now()));

        // Show slow machine warning + polling stopped message
        setShowSlowMachineWarning(true);
        setIsPollingStopped(true);

        // Trigger regrade if not already triggered
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-cypher-muted font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cypher-cyan border-t-transparent rounded-full animate-spin" />
          <span>DECRYPTING SUBMISSION #{id}...</span>
          {cooldownRemaining > 0 && (
            <span className="text-xs text-amber-500 mt-2">
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
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10 animate-bounce" />
          <span>LỖI TRUY XUẤT NODE #{id}: {error || "Không tìm thấy dữ liệu."}</span>
          <Link href="/problems" className="mt-4 text-xs text-cypher-cyan hover:underline uppercase">
            Quay lại Kho bài tập
          </Link>
        </div>
      </div>
    );
  }

  const verdict = determineVerdict(submission);
  const verdictConfig = VERDICT_STYLES[verdict] || VERDICT_STYLES["Pending"];
  const StatusIcon = verdictConfig.icon;

  // Map testcases from details JSON
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
        status: submission.status === "processing" ? "running" as const : "pending" as const,
      }));

  const runnedTestcases = mappedTestcases.filter(
    (t) => t.status !== "pending" && t.status !== "running"
  );

  let maxTime = submission.max_time_ms ?? 0;
  const totalTime = runnedTestcases.reduce((sum, t) => sum + (t.timeTaken || 0), 0);
  let maxMemory = submission.max_memory_mb ?? 0;
  const totalMemory = runnedTestcases.reduce((sum, t) => sum + (t.memoryTaken || 0), 0);


  if (runnedTestcases.length > 0 && maxTime === 0) {
    maxTime = Math.max(
      ...runnedTestcases.map((t) => t.timeTaken || 0)
    );
  }
  if (runnedTestcases.length > 0 && maxMemory === 0) {
    maxMemory = Math.max(
      ...runnedTestcases.map((t) => t.memoryTaken || 0)
    );
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-cypher-border bg-cypher-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/problems/${submission.problem_id}`}
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-cypher-muted hover:text-cypher-cyan transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại đề bài
            </Link>
          </div>

          <span className="text-lg font-black tracking-widest text-shimmer">
            CYPHER<span className="text-cypher-cyan">.REPORT</span>
          </span>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="cyber-panel p-6 rounded-2xl border-l-4 border-l-cypher-cyan bg-cypher-surface/10">
          <h2 className="text-xl md:text-2xl font-black uppercase text-foreground leading-normal">
            Lượt nộp bài cho{" "}
            <Link
              href={`/problems/${submission.problem_id}`}
              className="text-cypher-cyan hover:underline transition-all"
            >
              #{submission.problem_id}
            </Link>{" "}
            của <span className="text-shimmer">Agent_Candidate</span>
          </h2>
          <div className="flex flex-wrap gap-4 mt-3 text-xs font-mono text-cypher-muted">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {formattedTimestamp}
            </span>
            <span>|</span>
            <span className="flex items-center gap-1 text-cypher-cyan font-bold">
              <FileCode className="w-4 h-4" /> {submission.language === "cpp" ? "C++17 (GCC)" : submission.language.toUpperCase()}
            </span>
            <span>|</span>
            <span>ID lượt nộp: #{submission.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`cyber-panel p-6 rounded-2xl flex flex-col justify-center items-center text-center gap-3 ${verdictConfig.bg} ${verdictConfig.border} border ${showSlowMachineWarning ? "md:col-span-1" : ""}`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center bg-background border ${verdictConfig.border}`}
            >
              <StatusIcon
                className={`w-7 h-7 ${verdict === "Running" || verdict === "Pending" ? "animate-spin" : ""}`}
              />
            </div>
            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-cypher-muted">
                Kết quả cuối cùng
              </div>
              <h3 className={`text-2xl font-black uppercase mt-1 tracking-tight ${verdictConfig.text}`}>
                {shortVerdict} {showScore ? `(${submission.earned_points}/${submission.total_points}đ)` : ""}
              </h3>
            </div>
          </div>

          {showSlowMachineWarning && (
            <div className="md:col-span-2 cyber-panel p-6 rounded-2xl bg-amber-500/10 border-amber-500/30 border flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-500 animate-pulse" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-amber-500">
                    {isPollingStopped ? "Đã dừng gửi request" : "Máy chậm đang dừng hoạt động"}
                  </h4>
                  <p className="text-xs text-amber-400 mt-1">
                    {isPollingStopped
                      ? "Đã gửi request quá 10 giây. Hãy reload trang để kiểm tra lại kết quả (chờ 5s giữa các lần reload)."
                      : "Máy chấm phản hồi chậm. Bài của bạn sẽ được chấm lại trong vài giờ tới."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={`cyber-panel p-6 rounded-2xl bg-cypher-surface flex flex-col gap-2 ${showSlowMachineWarning ? "md:col-span-3" : "md:col-span-2"}`}>
            <h4 className="text-xs font-black uppercase tracking-widest text-cypher-cyan border-b border-cypher-border pb-2">
              Compiler logs / Nhật ký lỗi hệ thống
            </h4>
            <div className="flex-grow bg-zinc-950/80 rounded-xl border border-cypher-border p-4 font-mono text-xs text-zinc-300 overflow-y-auto max-h-[140px] min-h-[100px]">
              {verdict === "Pending" && (
                <div className="flex items-center gap-2 text-cypher-cyan animate-pulse">
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Đang xếp hàng chờ chấm...</span>
                </div>
              )}
              {verdict === "Running" && (
                <div className="flex items-center gap-2 text-cypher-cyan animate-pulse">
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Máy chấm độc lập đang thực thi mã nguồn...</span>
                </div>
              )}
              {verdict !== "Pending" && verdict !== "Running" && (
                <pre className="whitespace-pre-wrap text-red-400">
                  {submission.error_log || "Không có lỗi biên dịch. Thực thi thành công."}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Testcases matrix */}
        <div className="cyber-panel p-6 rounded-2xl flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-cypher-cyan">
              Testcases Evaluation Matrix
            </h4>
            <p className="text-xs text-cypher-muted mt-1">
              Bấm vào từng dòng testcase để xem chi tiết thông số thực thi.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {mappedTestcases.map((t, idx) => {
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
                      ? "ring-2 ring-cypher-cyan scale-[1.01] shadow-[0_0_12px_rgba(0,240,255,0.2)]"
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

          {runnedTestcases.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 p-5 rounded-xl border border-cypher-border bg-cypher-surface/40">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono text-cypher-muted tracking-wider">
                  Thời gian lâu nhất
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

          <AnimatePresence mode="wait">
            {selectedTestcase ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="cyber-panel p-5 rounded-xl bg-cypher-surface/60 border border-cypher-border flex flex-col gap-4 mt-2"
              >
                <div className="flex justify-between items-center border-b border-cypher-border pb-2">
                  <span className="text-sm font-bold text-cypher-cyan font-mono">
                    INSPECTOR: Testcase #{selectedTestcase.index}
                  </span>
                  <div className="flex gap-4 text-xs font-mono text-cypher-muted">
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

        <div className="cyber-panel p-6 rounded-2xl flex flex-col gap-3 bg-cypher-surface/10">
          <h4 className="text-sm font-black uppercase tracking-wider text-cypher-cyan flex items-center gap-2">
            <Code className="w-5 h-5" />
            Submitted Source Code
          </h4>

          <div className="rounded-xl border border-cypher-border overflow-hidden">
            <CodeEditor value={submission.source_code} onChange={() => {}} defaultCode={submission.source_code} readOnly={true} />
          </div>
        </div>
      </main>
    </div>
  );
}
