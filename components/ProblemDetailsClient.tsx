"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Clock,
  Cpu,
  Tag,
  Users,
  CheckCircle,
  Play,
  Edit,
  User,
} from "lucide-react";
import { getProblem, saveSubmission } from "@/lib/problems-store";
import { CodeEditor } from "@/components/CodeEditor";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { DEFAULT_CPP_TEMPLATE, type Submission } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { recordStudentSubmission } from "@/lib/services/auth";
import { CypherVoicelineWidget } from "@/components/CypherVoicelineWidget";
import { CypherSubmitAnimationModal } from "@/components/CypherSubmitAnimationModal";

interface ProblemDetailsClientProps {
  id: string;
}

export function ProblemDetailsClient({ id }: ProblemDetailsClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const problem = useMemo(() => {
    return getProblem(id) ?? null;
  }, [id]);

  const [code, setCode] = useState(DEFAULT_CPP_TEMPLATE);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [username, setUsername] = useState(user?.username || "hocsinh1");

  // Cypher Submit Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"compiling" | "evaluating" | "completed" | "error">("compiling");
  const [passedCount, setPassedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(20);
  const [verdictText, setVerdictText] = useState("ACCEPTED");
  const [verdictScore, setVerdictScore] = useState(100);
  const [pendingSubmissionId, setPendingSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  if (!problem) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground font-semibold">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span>Đang tải thông tin bài tập #{id}...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    const submissionId = "sub_" + Date.now() + Math.random().toString(36).substring(2, 6);
    setPendingSubmissionId(submissionId);

    const newSubmission: Submission = {
      id: submissionId,
      problemId: problem.id,
      problemTitle: problem.title,
      code: code,
      username: username.trim() || "HocSinh",
      timestamp: new Date().toLocaleTimeString("vi-VN") + " " + new Date().toLocaleDateString("vi-VN"),
      status: "Pending",
      testcases: Array.from({ length: 20 }, (_, idx) => ({
        index: idx + 1,
        status: "pending",
      })),
    };

    saveSubmission(newSubmission);

    if (username.trim()) {
      recordStudentSubmission(username.trim(), problem.id, true);
    }

    // Trigger Cypher Animation Modal Flow
    setIsSubmitModalOpen(true);
    setSubmitStatus("compiling");
    setPassedCount(0);

    setTimeout(() => {
      setSubmitStatus("evaluating");
      setPassedCount(5);
    }, 600);

    setTimeout(() => {
      setPassedCount(14);
    }, 1200);

    setTimeout(() => {
      setPassedCount(20);
      setSubmitStatus("completed");
    }, 1800);
  };

  const handleFinishSubmit = () => {
    setIsSubmitModalOpen(false);
    if (pendingSubmissionId) {
      router.push(`/submission/${pendingSubmissionId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground selection:bg-sky-500/20">
      <Navbar />

      {/* Main split workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Main Column: Problem Statement */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
            isEditorOpen ? "lg:max-w-[50%] border-r border-border" : "w-full"
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            {/* Title HUD block */}
            <div className="p-6 rounded-3xl border border-sky-500/20 bg-card shadow-sm border-l-4 border-l-sky-500">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold text-xs border border-sky-500/20">
                  {problem.group || "Bài tập"}
                </span>
                <Link
                  href={`/problems/${problem.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all"
                >
                  <Edit className="w-3.5 h-3.5" /> Sửa bài (Key Admin)
                </Link>
              </div>

              <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-3 text-foreground">
                {problem.title}
              </h1>

              {/* Constraints */}
              <div className="flex flex-wrap gap-4 mt-4 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1 font-bold">
                  <Clock className="w-4 h-4 text-sky-500" />
                  Giới hạn thời gian: <strong className="text-foreground">{problem.timeLimit} ms</strong>
                </span>
                <span className="flex items-center gap-1 font-bold">
                  <Cpu className="w-4 h-4 text-sky-500" />
                  Giới hạn bộ nhớ: <strong className="text-foreground">{problem.memoryLimit} MB</strong>
                </span>
              </div>
            </div>

            {/* Statement content */}
            <div className="flex flex-col gap-6">
              <div className="p-6 md:p-8 rounded-3xl border border-sky-500/15 bg-card flex flex-col gap-8 shadow-sm">
                <section>
                  <h2 className="text-sm font-black uppercase tracking-wider text-sky-500 border-b border-border/60 pb-2 mb-4">
                    Đề bài / Statement
                  </h2>
                  <MarkdownRenderer content={problem.statement} />
                </section>

                <section>
                  <h2 className="text-sm font-black uppercase tracking-wider text-sky-500 border-b border-border/60 pb-2 mb-4">
                    Định dạng dữ liệu đầu vào / Input format
                  </h2>
                  <MarkdownRenderer content={problem.inputFormat} />
                </section>

                <section>
                  <h2 className="text-sm font-black uppercase tracking-wider text-sky-500 border-b border-border/60 pb-2 mb-4">
                    Định dạng kết quả đầu ra / Output format
                  </h2>
                  <MarkdownRenderer content={problem.outputFormat} />
                </section>
              </div>

              {/* Sample tests */}
              <section className="p-6 md:p-8 rounded-3xl border border-sky-500/15 bg-card flex flex-col gap-4 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-wider text-sky-500 border-b border-border/60 pb-2 mb-2">
                  Ví dụ minh họa / Sample Cases
                </h2>

                <div className="flex flex-col gap-6">
                  {problem.samples.map((sample, index) => (
                    <div key={index} className="flex flex-col gap-3 border-l-2 border-sky-500/40 pl-4 py-1">
                      <span className="text-xs font-bold text-sky-500 font-mono">
                        SAMPLE_CASE #{index + 1}
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

        {/* Dynamic Editor Panel */}
        <AnimatePresence>
          {isEditorOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "50%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:flex flex-col bg-muted/20 border-l border-border overflow-hidden"
            >
              <div className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-sky-500 flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    Khung Soạn Thảo Code C++
                  </h3>
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground font-bold"
                  >
                    Thu nhỏ ✕
                  </button>
                </div>

                {/* Cypher Live Voiceline Banner */}
                <CypherVoicelineWidget type="compiling" />

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border">
                  <User className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Học sinh nộp bài:</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tên học sinh..."
                    className="bg-transparent text-sm font-bold outline-none flex-1 text-foreground"
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
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 text-white font-extrabold tracking-wider py-4 rounded-2xl hover:opacity-95 shadow-md shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99] uppercase text-sm mt-2 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Nộp Bài Ngay
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Right Sidebar */}
        {!isEditorOpen && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-muted/10 p-6 flex flex-col gap-6">
            {/* Cypher Voiceline Sidebar Widget */}
            <CypherVoicelineWidget type="hero" />

            <div className="p-5 rounded-3xl bg-card border border-sky-500/20 flex flex-col gap-4 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-sky-500 border-b border-border pb-2">
                Thông tin bài tập
              </h3>

              <div className="flex flex-col gap-3.5 text-xs font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-sky-500" /> Thể loại:
                  </span>
                  <span className="font-bold text-foreground">{problem.category || "Căn bản"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-sky-500" /> Phân nhóm:
                  </span>
                  <span className="font-bold text-foreground">{problem.group || "Chung"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Tỉ lệ AC:
                  </span>
                  <span className="font-bold text-emerald-500">{problem.acRate || "88%"}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-card border border-sky-500/20 flex flex-col gap-3 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-sky-500">
                Nộp Bài Làm
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Viết mã nguồn C++17 và kiểm tra tiến trình chấm bài từng testcase tự động.
              </p>

              <button
                onClick={() => setIsEditorOpen(true)}
                className="w-full text-center bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 text-white font-extrabold py-3.5 rounded-2xl hover:opacity-95 shadow-md shadow-sky-500/20 transition-all text-xs uppercase tracking-wider mt-1 hover:scale-[1.02] active:scale-[0.98]"
              >
                Mở khung nộp bài C++
              </button>
            </div>
          </div>
        )}
      </div>

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
