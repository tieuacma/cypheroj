"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Clock,
  Cpu,
  Tag,
  ChevronLeft,
  Play,
  Edit,
  User,
  RotateCcw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Gauge,
} from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { DEFAULT_CPP_TEMPLATE } from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SerializedProblem } from "@/lib/actions/problems";
import type { DbSubmission } from "@/lib/db/types";
import { CypherSubmitAnimationModal } from "@/components/CypherSubmitAnimationModal";

interface ProblemDetailsClientProps {
  problem: SerializedProblem;
}

export function ProblemDetailsClient({ problem }: ProblemDetailsClientProps) {
  const router = useRouter();

  const [code, setCode] = useState(DEFAULT_CPP_TEMPLATE);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [username, setUsername] = useState("Cypher");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Cypher Submit Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"compiling" | "evaluating" | "completed" | "error">("compiling");
  const [passedCount, setPassedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(20);
  const [verdictText, setVerdictText] = useState("ACCEPTED");
  const [verdictScore, setVerdictScore] = useState(100);
  const [pendingSubmissionId, setPendingSubmissionId] = useState<string | null>(null);


  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    // Trigger Cypher Animation Modal Flow
    setIsSubmitModalOpen(true);
    setSubmitStatus("compiling");
    setPassedCount(0);
    setVerdictText("EVALUATING");
    setVerdictScore(0);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: problem.id,
          code: code,
          username: username.trim() || "Guest_Agent",
        }),
      });

      const rawText = await response.text();

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error("Dữ liệu trả về từ Server không phải JSON chuẩn:", rawText);
        throw new Error("Phản hồi từ máy chủ bị lỗi định dạng.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Submission failed");
      }

      const submissionId = data.submission_id;

      if (!submissionId) {
        throw new Error("API did not return a submission_id.");
      }

      setPendingSubmissionId(submissionId);

      // Start evaluating stage & poll for real judging results
      setTimeout(() => {
        setSubmitStatus("evaluating");
      }, 500);

      let attempts = 0;
      const maxAttempts = 16; // Poll up to ~8 seconds

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const subRes = await fetch(`/api/submissions/${submissionId}`);
          if (subRes.ok) {
            const subData: DbSubmission = await subRes.json();
            const totalPts = subData.total_points || 100;
            const earnedPts = subData.earned_points ?? 0;
            setVerdictScore(earnedPts);

            if (subData.details && subData.details.length > 0) {
              setTotalCount(subData.details.length);
              const acs = subData.details.filter((d) => d.status === "ac").length;
              setPassedCount(acs);
            } else {
              setPassedCount(Math.min(totalCount, Math.floor((attempts / maxAttempts) * totalCount)));
            }

            if (subData.status === "completed" || subData.status === "internal_error" || attempts >= maxAttempts) {
              clearInterval(pollInterval);
              let vText = "ACCEPTED";
              if (subData.status === "internal_error") {
                vText = "RUNTIME ERROR";
              } else if (subData.error_log && subData.error_log.trim().length > 0) {
                vText = subData.error_log.toLowerCase().includes("compile") ? "COMPILATION ERROR" : "RUNTIME ERROR";
              } else if (earnedPts === totalPts && totalPts > 0) {
                vText = "ACCEPTED";
              } else if (earnedPts > 0) {
                vText = `PARTIAL (${earnedPts}/${totalPts}đ)`;
              } else {
                vText = "WRONG ANSWER";
              }
              setVerdictText(vText);
              setSubmitStatus("completed");
            }
          }
        } catch (pollErr) {
          console.error("Poll submission error:", pollErr);
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setSubmitStatus("completed");
          }
        }
      }, 500);

    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi nộp bài.");
      setSubmitStatus("error");
      setIsSubmitting(false);
    }
  }, [code, isSubmitting, problem.id, totalCount, username]);

  const handleFinishSubmit = () => {
    setIsSubmitModalOpen(false);
    setIsSubmitting(false);
    if (pendingSubmissionId) {
      router.push(`/submission/${pendingSubmissionId}`);
    }
  };

  // Global keyboard shortcut: Ctrl+Enter (or Cmd+Enter) to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isEditorOpen) {
          setIsEditorOpen(true);
        }
        void handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit, isEditorOpen]);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục mã nguồn mẫu ban đầu?")) {
      setCode(DEFAULT_CPP_TEMPLATE);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-cypher-cyan/30">
      {/* Header */}
      <header className="border-b border-cypher-border bg-cypher-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/problems"
              className="flex items-center gap-1.5 text-sm font-semibold text-cypher-muted hover:text-cypher-cyan transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Kho bài tập
            </Link>
            <span className="text-cypher-border/60">|</span>
            <span className="text-sm font-mono text-cypher-muted">
              <span className="text-cypher-cyan font-bold">#{problem.id}</span>
            </span>
          </div>

          <span className="text-lg font-black tracking-widest text-shimmer hidden md:inline">
            CYPHER<span className="text-cypher-cyan">.WORKSPACE</span>
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                isEditorOpen
                  ? "bg-cypher-cyan text-zinc-950 border-cypher-cyan shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                  : "bg-cypher-surface border-cypher-border hover:border-cypher-cyan hover:text-cypher-cyan"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              {isEditorOpen ? "Đóng Khung Code" : "Khung Nộp Bài"}
            </button>
            <Link
              href={`/problems/${problem.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cypher-border hover:border-cypher-cyan hover:text-cypher-cyan text-xs font-bold transition-all bg-cypher-surface"
            >
              <Edit className="w-3.5 h-3.5" />
              Sửa đề
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main split dashboard */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left/Main Column: Problem Statement */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
            isEditorOpen ? "lg:max-w-[50%] border-r border-cypher-border" : "w-full"
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            {/* Title HUD block */}
            <div className="cyber-panel p-6 rounded-2xl border-l-4 border-l-cypher-cyan shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="cyber-badge-cyan">
                  {problem.category || "General"}
                </span>
                <span className="text-xs font-mono text-cypher-muted font-bold">
                  Mã bài: #{problem.id}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black mt-3 text-foreground tracking-tight">
                {problem.title}
              </h1>

              <div className="flex flex-wrap gap-4 mt-4 text-xs sm:text-sm text-cypher-muted">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cypher-cyan" />
                  Thời gian: <strong className="text-foreground font-mono font-bold">{problem.time_limit_ms} ms</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cypher-cyan" />
                  Bộ nhớ: <strong className="text-foreground font-mono font-bold">{problem.memory_limit_mb} MB</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-amber-500" />
                  Elo: <strong className="text-amber-500 font-mono font-bold">{problem.elo_rating ?? 1000}</strong>
                </span>
              </div>
            </div>

            {/* Error banner if submit fails */}
            {error && (
              <div className="cyber-panel p-4 rounded-xl flex items-center gap-3 bg-red-500/10 border-red-500/30 text-red-500">
                <span className="text-xs font-bold font-mono">LỖI NỘP BÀI: {error}</span>
              </div>
            )}

            {/* Statement content unified block */}
            <div className="flex flex-col gap-6">
              <div className="cyber-panel p-6 rounded-2xl flex flex-col gap-8 shadow-sm">
                <section>
                  <h2 className="soft-section-title mb-4">Đề bài</h2>
                  <MarkdownRenderer content={problem.content} />
                </section>

                {problem.input_format && (
                  <section>
                    <h2 className="soft-section-title mb-4">Input Format — Định dạng đầu vào</h2>
                    <MarkdownRenderer content={problem.input_format} />
                  </section>
                )}

                {problem.output_format && (
                  <section>
                    <h2 className="soft-section-title mb-4">Output Format — Định dạng đầu ra</h2>
                    <MarkdownRenderer content={problem.output_format} />
                  </section>
                )}
              </div>

              {/* Sample tests unified block */}
              {(problem.sample_input || problem.sample_output) && (
                <section className="cyber-panel p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
                  <h2 className="soft-section-title mb-2">Ví dụ minh họa (Sample Tests)</h2>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CodeBlock label="Sample Input" code={problem.sample_input} />
                      <CodeBlock label="Sample Output" code={problem.sample_output} />
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Submission Panel (IDE View) */}
        <AnimatePresence>
          {isEditorOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isFullscreen ? "100%" : "50%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`hidden lg:flex flex-col bg-cypher-surface/40 overflow-hidden border-l border-cypher-border ${
                isFullscreen ? "fixed inset-0 z-50 bg-background" : ""
              }`}
            >
              <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto">
                {/* Editor Toolbar */}
                <div className="flex justify-between items-center border-b border-cypher-border pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cypher-cyan" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-cypher-cyan">
                      C++ Compiler Console (GCC 17)
                    </h3>
                    <span className="text-[10px] font-mono text-cypher-muted bg-cypher-cyan/10 px-2 py-0.5 rounded border border-cypher-cyan/20">
                      Ctrl + Enter to submit
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCode}
                      className="p-1.5 rounded-lg border border-cypher-border hover:border-cypher-cyan text-cypher-muted hover:text-cypher-cyan text-xs transition-colors"
                      title="Reset về Code mẫu"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg border border-cypher-border hover:border-cypher-cyan text-cypher-muted hover:text-cypher-cyan text-xs transition-colors"
                      title="Sao chép Code"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1.5 rounded-lg border border-cypher-border hover:border-cypher-cyan text-cypher-muted hover:text-cypher-cyan text-xs transition-colors"
                      title={isFullscreen ? "Thoát Toàn màn hình" : "Toàn màn hình"}
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => {
                        setIsFullscreen(false);
                        setIsEditorOpen(false);
                      }}
                      className="px-2 py-1 rounded text-xs text-cypher-muted hover:text-foreground font-bold border border-cypher-border"
                    >
                      Thu nhỏ ✕
                    </button>
                  </div>
                </div>

                {/* Submitter Name HUD Input */}
                <div className="flex items-center gap-3 cyber-panel p-2.5 rounded-xl bg-background/60 border border-cypher-border">
                  <User className="w-4 h-4 text-cypher-cyan" />
                  <span className="text-xs font-bold text-cypher-muted font-mono uppercase">Tên thí sinh:</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên của bạn..."
                    className="bg-transparent text-xs focus:outline-none flex-grow text-foreground font-bold"
                  />
                </div>

                {/* Code Editor */}
                <div className="flex-1 min-h-[420px] rounded-xl overflow-hidden border border-cypher-border">
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    defaultCode={DEFAULT_CPP_TEMPLATE}
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-glow w-full flex items-center justify-center gap-2 bg-cypher-cyan text-zinc-950 font-black tracking-wider py-3.5 rounded-xl hover:bg-cypher-cyan/90 transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                >
                  <Play className="w-4 h-4 fill-current animate-pulse" />
                  {isSubmitting ? "Đang gửi bài và chấm..." : "Nộp bài và chấm (Ctrl + Enter)"}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Right Sidebar: Details & Toggle Trigger */}
        {!isEditorOpen && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-cypher-border bg-cypher-surface/40 p-6 flex flex-col gap-6">
            {/* Meta details card */}
            <div className="cyber-panel p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
              <h3 className="soft-label font-bold uppercase tracking-wider text-foreground">
                Thông tin bài tập
              </h3>

              <div className="flex flex-col gap-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-cypher-muted flex items-center gap-1.5 text-xs">
                    <Tag className="w-3.5 h-3.5 text-cypher-cyan" /> Thể loại
                  </span>
                  <span className="font-semibold text-foreground text-xs">{problem.category || "General"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-cypher-muted flex items-center gap-1.5 text-xs">
                    <Gauge className="w-3.5 h-3.5 text-amber-500" /> Hệ số Elo
                  </span>
                  <span className="font-bold text-amber-500 font-mono text-sm">{problem.elo_rating ?? 1000}</span>
                </div>

                {problem.is_subtask && problem.subtasks && problem.subtasks.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-cypher-border/40">
                    <span className="text-[11px] font-bold text-cypher-muted uppercase font-mono">Cấu hình Subtasks:</span>
                    <div className="flex flex-col gap-1.5">
                      {problem.subtasks.map((sub, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-muted/50 dark:bg-zinc-950/40 p-2 rounded-lg border border-cypher-border/20">
                          <span className="text-cypher-muted truncate max-w-[150px]">{sub.label}</span>
                          <span className="font-bold text-cypher-cyan font-mono">{sub.points}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Trigger Card */}
            <div className="cyber-panel p-5 rounded-2xl bg-cypher-surface/80 flex flex-col gap-3 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-cypher-cyan">
                Gửi lời giải
              </h3>
              <p className="text-xs text-cypher-muted leading-relaxed">
                Nộp mã nguồn C++ để thực thi chấm tự động qua trình biên dịch GCC. Bấm phím tắt <code className="font-mono text-cypher-cyan">Ctrl + Enter</code> để nộp nhanh.
              </p>

              {/* Username Input for Sidebar Submit */}
              <div className="flex items-center gap-2 border border-cypher-border rounded-xl p-2.5 bg-background text-sm">
                <User className="w-3.5 h-3.5 text-cypher-cyan" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="bg-transparent text-xs outline-none w-full text-foreground font-bold"
                />
              </div>

              {/* Submit panel trigger button */}
              <button
                onClick={() => setIsEditorOpen(true)}
                className="w-full text-center bg-cypher-cyan text-zinc-950 font-black py-3 rounded-xl hover:bg-cypher-cyan/95 transition-all text-xs uppercase tracking-wider mt-1 shadow-[0_0_15px_rgba(14,165,233,0.3)]"
              >
                Mở khung nộp bài
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Fallback Editor */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/95 flex flex-col p-4 gap-4 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-cypher-border pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-cypher-cyan flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                C++ Mobile Editor Console
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-cypher-border text-xs font-bold bg-cypher-surface"
              >
                Đóng ✕
              </button>
            </div>

            <div className="flex items-center gap-2 border border-cypher-border rounded-xl p-3 bg-cypher-surface">
              <User className="w-4 h-4 text-cypher-cyan" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên thí sinh"
                className="bg-transparent text-sm outline-none w-full text-foreground font-bold"
              />
            </div>

            <div className="flex-1 min-h-[300px]">
              <CodeEditor value={code} onChange={setCode} defaultCode={DEFAULT_CPP_TEMPLATE} />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full text-center bg-cypher-cyan text-zinc-950 font-black py-4 rounded-xl hover:bg-cypher-cyan/90 transition-all text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {isSubmitting ? "Đang gửi..." : "Nộp bài và chấm"}
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* Cypher Animated Submit Modal */}
      <CypherSubmitAnimationModal
        isOpen={isSubmitModalOpen}
        onClose={handleFinishSubmit}
        status={submitStatus}
        passedCount={passedCount}
        totalCount={totalCount}
        verdictText={verdictText}
        verdictScore={verdictScore}
        codeSnippet={code}
      />
    </div>
  );
}
