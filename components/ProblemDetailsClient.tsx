"use client";

import { useMemo, useState } from "react";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Clock, Cpu, Tag, Users, CheckCircle, ChevronLeft, Play, Edit, User } from "lucide-react";
import { getProblem, saveSubmission } from "@/lib/problems-store";
import { CodeEditor } from "@/components/CodeEditor";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { DEFAULT_CPP_TEMPLATE, type Submission } from "@/lib/types";

import { ThemeToggle } from "@/components/ThemeToggle";

interface ProblemDetailsClientProps {
  id: string;
}

export function ProblemDetailsClient({ id }: ProblemDetailsClientProps) {
  const router = useRouter();
  const problem = useMemo(() => {
    return getProblem(id) ?? null;
  }, [id]);


  const [code, setCode] = useState(DEFAULT_CPP_TEMPLATE);

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [username, setUsername] = useState("Cypher");



  if (!problem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-cypher-muted font-mono">

        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cypher-cyan border-t-transparent rounded-full animate-spin" />
          <span>ACCESSING SECURE NODE #{id}...</span>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    // Generate a unique submission ID
    const submissionId = "sub_" + Date.now() + Math.random().toString(36).substring(2, 6);
    
    const newSubmission: Submission = {
      id: submissionId,
      problemId: problem.id,
      problemTitle: problem.title,
      code: code,
      username: username.trim() || "Guest_Agent",
      timestamp: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
      status: "Pending",
      testcases: Array.from({ length: 20 }, (_, idx) => ({
        index: idx + 1,
        status: "pending",
      })),
    };

    // Save to localStorage store
    saveSubmission(newSubmission);
    
    // Redirect to submission route
    router.push(`/submission/${submissionId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-cypher-border bg-cypher-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/problems" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cypher-muted hover:text-cypher-cyan transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Thoát
            </Link>
            <span className="text-cypher-border">|</span>
            <span className="text-xs font-mono text-cypher-muted">
              NODE_ID: <span className="text-cypher-cyan font-bold">#{problem.id}</span>
            </span>
          </div>

          <span className="text-lg font-black tracking-widest text-shimmer hidden md:inline">
            CYPHER<span className="text-cypher-cyan">.WORKSPACE</span>
          </span>

          <div className="flex items-center gap-3">
            <Link
              href={`/problem/${problem.id}/edit`}
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
            <div className="cyber-panel p-6 rounded-2xl border-l-4 border-l-cypher-cyan">
              <span className="text-xs font-bold uppercase tracking-wider text-cypher-cyan">
                {problem.group || "Bài tập"}
              </span>
              <h1 className="text-3xl font-black tracking-tight mt-1 uppercase text-foreground">
                {problem.title}
              </h1>
              
              {/* Constraints shown directly under title - DMOJ/Codeforces hybrid style */}
              <div className="flex flex-wrap gap-4 mt-4 text-xs font-mono text-cypher-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-cypher-cyan" />
                  Giới hạn thời gian: <strong className="text-foreground">{problem.timeLimit} ms</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-4 h-4 text-cypher-cyan" />
                  Giới hạn bộ nhớ: <strong className="text-foreground">{problem.memoryLimit} MB</strong>
                </span>
              </div>
            </div>

            {/* Statement content unified block */}
            <div className="flex flex-col gap-6">
              <div className="cyber-panel p-6 rounded-2xl bg-cypher-surface/30 flex flex-col gap-8">
                <section>
                  <h2 className="text-sm font-black uppercase tracking-wider text-cypher-cyan border-b border-cypher-border/40 pb-2 mb-4">
                    Đề bài / Statement
                  </h2>
                  <MarkdownRenderer content={problem.statement} />
                </section>

                <section>
                  <h2 className="text-sm font-black uppercase tracking-wider text-cypher-cyan border-b border-cypher-border/40 pb-2 mb-4">
                    Định dạng dữ liệu vào / Input format
                  </h2>
                  <MarkdownRenderer content={problem.inputFormat} />
                </section>

                <section>
                  <h2 className="text-sm font-black uppercase tracking-wider text-cypher-cyan border-b border-cypher-border/40 pb-2 mb-4">
                    Định dạng kết quả đầu ra / Output format
                  </h2>
                  <MarkdownRenderer content={problem.outputFormat} />
                </section>
              </div>

              {/* Sample tests unified block */}
              <section className="cyber-panel p-6 rounded-2xl bg-cypher-surface/30 flex flex-col gap-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-cypher-cyan border-b border-cypher-border/40 pb-2 mb-2">
                  Ví dụ minh họa / Samples
                </h2>
                
                <div className="flex flex-col gap-6">
                  {problem.samples.map((sample, index) => (
                    <div key={index} className="flex flex-col gap-3 border-l-2 border-cypher-cyan/40 pl-4 py-1">
                      <span className="text-xs font-bold text-cypher-cyan font-mono">
                        SAMPLE_TEST_CASE #{index + 1}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CodeBlock label="Dữ liệu vào (Input)" code={sample.input} />
                        <CodeBlock label="Kết quả ra (Output)" code={sample.output} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Dynamic Submission Panel (LeetCode/CF layout mix) */}
        <AnimatePresence>
          {isEditorOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "50%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:flex flex-col bg-cypher-surface/30 overflow-hidden"
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
                <div className="flex items-center gap-3 cyber-panel p-4 rounded-xl bg-background/50 border border-cypher-border focus-within:border-cypher-cyan focus-within:ring-2 focus-within:ring-cypher-cyan/20 transition-all">
                  <User className="w-5 h-5 text-cypher-cyan" />
                  <span className="text-xs font-bold text-cypher-muted font-mono uppercase">Agent Identifier:</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên của bạn..."
                    className="bg-transparent text-sm focus:outline-none flex-grow text-foreground font-semibold placeholder:text-cypher-muted/50"
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
                  className="btn-glow w-full flex items-center justify-center gap-2 bg-cypher-cyan text-zinc-950 font-black tracking-wider py-4 rounded-xl hover:bg-cypher-cyan/95 transition-all hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:scale-[1.02] active:scale-[0.98] uppercase text-sm mt-2 border-2 border-transparent hover:border-cypher-cyan/30"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Nộp bài và chấm / Run Judge
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Right Sidebar: Codeforces Details & Toggle Trigger */}
        {!isEditorOpen && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-cypher-border bg-cypher-surface/40 p-6 flex flex-col gap-6">
            {/* Meta details card */}
            <div className="cyber-panel p-5 rounded-2xl bg-cypher-surface flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-cypher-muted border-b border-cypher-border pb-2">
                Problem Metadata
              </h3>
              
              <div className="flex flex-col gap-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-cypher-muted flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-cypher-cyan" /> Thể loại:
                  </span>
                  <span className="font-bold text-foreground">{problem.category || "Basic"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cypher-muted flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cypher-cyan" /> Phân nhóm:
                  </span>
                  <span className="font-bold text-foreground">{problem.group || "Chưa phân loại"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-cypher-muted flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-cypher-cyan" /> Tỉ lệ AC:
                  </span>
                  <span className="font-bold text-green-500">{problem.acRate || "88%"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-cypher-muted flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-cypher-cyan" /> Lượt AC:
                  </span>
                  <span className="font-bold text-foreground font-mono">{problem.acCount || 0}</span>
                </div>
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
              <div className="flex items-center gap-2 border border-cypher-border rounded-xl p-3 bg-background text-sm focus-within:border-cypher-cyan focus-within:ring-2 focus-within:ring-cypher-cyan/20 transition-all">
                <User className="w-4 h-4 text-cypher-cyan" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="bg-transparent text-xs outline-none w-full text-foreground font-bold placeholder:text-cypher-muted/50"
                />
              </div>

              {/* Submit panel trigger button */}
              <button
                onClick={() => setIsEditorOpen(true)}
                className="btn-glow w-full text-center bg-cypher-cyan text-zinc-950 font-black py-3 rounded-xl hover:bg-cypher-cyan/95 transition-all text-xs uppercase tracking-wider mt-1 hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent hover:border-cypher-cyan/30"
              >
                Mở khung nộp bài
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Tablet Fallback Editor panel shown at bottom if toggled open */}
      <AnimatePresence>
        {isEditorOpen ? (
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

            <div className="flex items-center gap-2 border border-cypher-border rounded-xl p-3 bg-cypher-surface focus-within:border-cypher-cyan focus-within:ring-2 focus-within:ring-cypher-cyan/20 transition-all">
              <User className="w-4 h-4 text-cypher-cyan" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Agent Username"
                className="bg-transparent text-sm outline-none w-full text-foreground font-bold placeholder:text-cypher-muted/50"
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
              className="btn-glow w-full text-center bg-cypher-cyan text-zinc-950 font-black py-4 rounded-xl hover:bg-cypher-cyan/90 transition-all text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent hover:border-cypher-cyan/30"
            >
              Nộp bài và chấm
            </button>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
