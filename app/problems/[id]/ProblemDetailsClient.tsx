"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Clock, Cpu, Tag, ChevronLeft, Play, Edit, User } from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { DEFAULT_CPP_TEMPLATE } from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SerializedProblem } from "@/lib/actions/problems";
import { getProblemTotalPoints } from "@/lib/db/types";

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

  const totalPoints = getProblemTotalPoints(problem);

  const handleSubmit = async () => {
  setError(null);
  setIsSubmitting(true);

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

    // 1. Đọc raw text từ response trước
    const rawText = await response.text();

    // 2. Parse JSON an toàn
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Dữ liệu trả về từ Server không phải JSON chuẩn:", rawText);
      throw new Error("Phản hồi từ máy chủ bị lỗi định dạng.");
    }

    // 3. Kiểm tra status HTTP
    if (!response.ok) {
      throw new Error(data?.error || "Submission failed");
    }

    const submissionId = data.submission_id;

    if (!submissionId) {
      throw new Error("API did not return a submission_id.");
    }

    // Redirect to submission route
    router.push(`/submission/${submissionId}`);
  } catch (err: unknown) {
    console.error(err);
    setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi nộp bài.");
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-cypher-border bg-cypher-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/problems" className="flex items-center gap-1.5 text-sm font-medium text-cypher-muted hover:text-cypher-cyan transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </Link>
            <span className="text-cypher-border/60">|</span>
            <span className="text-sm text-cypher-muted">
              <span className="text-cypher-cyan font-medium">#{problem.id}</span>
            </span>
          </div>

          <span className="text-lg font-semibold tracking-tight text-shimmer hidden md:inline">
            Cypher<span className="text-cypher-cyan">.Workspace</span>
          </span>

          <div className="flex items-center gap-3">
            <Link
              href={`/problems/${problem.id}/edit`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cypher-border hover:border-cypher-cyan hover:text-cypher-cyan text-xs font-bold transition-all bg-cypher-surface"
            >
              <Edit className="w-3.5 h-3.5" />
              Chỉnh sửa đề
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main split dashboard */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Main Column: Problem Statement */}
        <div 
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
            isEditorOpen ? "lg:max-w-[50%] border-r border-cypher-border" : "w-full"
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            {/* Title HUD block */}
            <div className="cyber-panel p-6 rounded-2xl border-l-[3px] border-l-cypher-cyan">
              <span className="soft-badge">
                {problem.category || "Bài tập"}
              </span>
              <h1 className="text-3xl soft-heading mt-2 text-foreground">
                {problem.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-cypher-muted">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cypher-cyan" />
                  Thời gian: <strong className="text-foreground font-medium">{problem.time_limit_ms} ms</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cypher-cyan" />
                  Bộ nhớ: <strong className="text-foreground font-medium">{problem.memory_limit_mb} MB</strong>
                </span>
                <span>
                  Điểm: <strong className="text-cypher-cyan font-medium">{totalPoints}đ</strong>
                </span>
              </div>
            </div>

            {/* Error banner if submit fails */}
            {error && (
              <div className="cyber-panel p-4 rounded-xl flex items-center gap-3 bg-red-500/5 border-red-500/20 text-red-500">
                <span className="text-xs font-bold font-mono">ERROR: {error}</span>
              </div>
            )}

            {/* Statement content unified block */}
            <div className="flex flex-col gap-6">
              <div className="cyber-panel p-6 rounded-2xl flex flex-col gap-8">
                <section>
                  <h2 className="soft-section-title mb-4">
                    Đề bài
                  </h2>
                  <MarkdownRenderer content={problem.content} />
                </section>

                {problem.input_format && (
                  <section>
                    <h2 className="soft-section-title mb-4">
                      Input Format — Định dạng đầu vào
                    </h2>
                    <MarkdownRenderer content={problem.input_format} />
                  </section>
                )}

                {problem.output_format && (
                  <section>
                    <h2 className="soft-section-title mb-4">
                      Output Format — Định dạng đầu ra
                    </h2>
                    <MarkdownRenderer content={problem.output_format} />
                  </section>
                )}
              </div>

              {/* Sample tests unified block */}
              {(problem.sample_input || problem.sample_output) && (
                <section className="cyber-panel p-6 rounded-2xl flex flex-col gap-4">
                  <h2 className="soft-section-title mb-2">
                    Ví dụ minh họa
                  </h2>
                  
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 border-l-2 border-cypher-cyan/30 pl-4 py-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CodeBlock label="Input" code={problem.sample_input} />
                        <CodeBlock label="Output" code={problem.sample_output} />
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Submission Panel */}
        <AnimatePresence>
          {isEditorOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "50%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:flex flex-col bg-cypher-surface/30 overflow-hidden border-l border-cypher-border"
            >
              <div className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto">
                <div className="flex justify-between items-center border-b border-cypher-border pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-cypher-cyan flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    C++ Compiler Console
                  </h3>
                  <button 
                    onClick={() => setIsEditorOpen(false)}
                    className="text-xs text-cypher-muted hover:text-foreground font-bold"
                  >
                    Thu nhỏ ✕
                  </button>
                </div>

                {/* Submitter Name HUD Input */}
                <div className="flex items-center gap-3 cyber-panel p-3 rounded-xl bg-background/50 border border-cypher-border">
                  <User className="w-4 h-4 text-cypher-cyan" />
                  <span className="text-xs font-bold text-cypher-muted font-mono uppercase">Agent Identifier:</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên của bạn..."
                    className="bg-transparent text-sm focus:outline-none flex-grow text-foreground font-semibold"
                  />
                </div>

                <div className="flex-1 min-h-[400px]">
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    defaultCode={DEFAULT_CPP_TEMPLATE}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-cypher-cyan text-zinc-950 font-black tracking-wider py-4 rounded-xl hover:bg-cypher-cyan/95 transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] uppercase text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4.5 h-4.5 fill-current animate-pulse" />
                  {isSubmitting ? "Đang gửi..." : "Nộp bài và chấm / Run Judge"}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Right Sidebar: Details & Toggle Trigger */}
        {!isEditorOpen && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-cypher-border bg-cypher-surface/40 p-6 flex flex-col gap-6">
            {/* Meta details card */}
            <div className="cyber-panel p-5 rounded-2xl flex flex-col gap-4">
              <h3 className="soft-label font-semibold text-foreground">
                Thông tin bài tập
              </h3>
              
              <div className="flex flex-col gap-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-cypher-muted flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-cypher-cyan" /> Thể loại
                  </span>
                  <span className="font-medium text-foreground">{problem.category || "General"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cypher-muted">
                    Điểm tối đa
                  </span>
                  <span className="font-medium text-cypher-cyan font-mono">{totalPoints}đ</span>
                </div>

                {problem.is_subtask && problem.subtasks && problem.subtasks.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-cypher-border/40">
                    <span className="text-xs font-bold text-cypher-muted uppercase font-mono">Danh sách Subtasks:</span>
                    <div className="flex flex-col gap-1.5">
                      {problem.subtasks.map((sub, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-zinc-950/40 p-1.5 rounded border border-cypher-border/20">
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
            <div className="cyber-panel p-5 rounded-2xl bg-cypher-surface/80 flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-cypher-muted">
                Submit Solution
              </h3>
              <p className="text-xs text-cypher-muted">
                Compile your code using standard GCC C++17 compiler and stream grading results.
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
                className="w-full text-center bg-cypher-cyan text-zinc-950 font-black py-3 rounded-xl hover:bg-cypher-cyan/95 transition-all text-xs uppercase tracking-wider mt-1"
              >
                Mở khung nộp bài
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Tablet Fallback Editor panel shown at bottom if toggled open */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/95 flex flex-col p-4 gap-4 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-cypher-border pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-cypher-cyan flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Mobile Editor Console
              </h3>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-cypher-border hover:border-red-500 hover:text-red-500 text-xs font-bold bg-cypher-surface transition-all"
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
                placeholder="Agent Username"
                className="bg-transparent text-sm outline-none w-full text-foreground font-bold"
              />
            </div>

            <div className="flex-1 min-h-[300px]">
              <CodeEditor
                value={code}
                onChange={setCode}
                defaultCode={DEFAULT_CPP_TEMPLATE}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full text-center bg-cypher-cyan text-zinc-950 font-black py-4 rounded-xl hover:bg-cypher-cyan/90 transition-all text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang gửi..." : "Nộp bài và chấm"}
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
