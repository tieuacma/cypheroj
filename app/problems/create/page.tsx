"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  ChevronLeft,
  ShieldAlert,
  Cpu,
  Clock,
  Edit,
  Plus,
  Trash2,
  Code,
  Sigma,
  Table,
  Bold,
  Italic,
  Eye,
  FileText,
} from "lucide-react";
import { createProblemAction } from "@/lib/actions/problems";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SubtaskConfig, ProblemInput } from "@/lib/db/types";

export default function CreateProblemPage() {
  const router = useRouter();

  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [group, setGroup] = useState("");
  const [timeLimitMs, setTimeLimitMs] = useState(1000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(256);
  const [content, setContent] = useState("");
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [isSubtask, setIsSubtask] = useState(false);
  const [subtasks, setSubtasks] = useState<SubtaskConfig[]>([]);

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const PROBLEM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  const insertSnippet = (snippet: string) => {
    setContent((prev) => prev + (prev.endsWith("\n") || !prev ? "" : "\n") + snippet);
  };

  const handleSampleChange = (key: "input" | "output", value: string) => {
    if (key === "input") setSampleInput(value);
    else setSampleOutput(value);
  };

  const handleSubtaskChange = (index: number, key: keyof SubtaskConfig, value: string | number) => {
    const next = [...subtasks];
    next[index] = {
      ...next[index],
      [key]: key === "points" ? Number(value) : value,
    };
    setSubtasks(next);
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { label: `Subtask ${subtasks.length + 1}`, points: 10 }]);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== index));
  };

  const totalPoints = isSubtask
    ? subtasks.reduce((sum, s) => sum + s.points, 0)
    : 100;

  const handleSave = async () => {
    setError(null);

    const normalizedId = id.trim().toLowerCase();
    if (!normalizedId) {
      setError("Mã bài tập (ID) không được để trống.");
      return;
    }
    if (!PROBLEM_ID_PATTERN.test(normalizedId)) {
      setError('Mã bài tập không hợp lệ. Chỉ dùng chữ thường, số và dấu gạch ngang (ví dụ: "two-sum").');
      return;
    }
    if (!title.trim()) {
      setError("Tên bài tập không được để trống.");
      return;
    }
    if (!content.trim()) {
      setError("Nội dung đề bài không được để trống.");
      return;
    }

    setIsSaving(true);

    try {
      const payload: ProblemInput = {
        id: normalizedId,
        title: title.trim(),
        content: content.trim(),
        input_format: inputFormat.trim(),
        output_format: outputFormat.trim(),
        category: category.trim(),
        sample_input: sampleInput,
        sample_output: sampleOutput,
        time_limit_ms: timeLimitMs,
        memory_limit_mb: memoryLimitMb,
        is_subtask: isSubtask,
        subtasks: isSubtask ? subtasks : [],
      };

      const result = await createProblemAction(payload);
      if (!result) {
        throw new Error("Lỗi không xác định khi lưu bài tập.");
      }

      router.push(`/problems/${result.id}`);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không thể tạo bài tập mới. Hãy kiểm tra lại kết nối Database.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-cypher-cyan/30">
      {/* Header */}
      <header className="border-b border-cypher-border bg-cypher-surface/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/problems"
              className="flex items-center gap-1.5 text-sm font-semibold text-cypher-muted hover:text-cypher-cyan transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </Link>
            <span className="text-cypher-border/60">|</span>
            <span className="text-sm font-bold text-cypher-muted">Tạo bài tập mới</span>
          </div>

          <span className="text-lg font-black tracking-widest text-shimmer hidden md:inline">
            CYPHER<span className="text-cypher-cyan">.CREATOR</span>
          </span>

          <div className="flex items-center gap-3">
            {/* Mobile Tab Toggle */}
            <div className="flex lg:hidden items-center p-1 bg-cypher-surface border border-cypher-border rounded-xl">
              <button
                onClick={() => setActiveTab("edit")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "edit" ? "bg-cypher-cyan text-zinc-950" : "text-cypher-muted"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "preview" ? "bg-cypher-cyan text-zinc-950" : "text-cypher-muted"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="soft-btn-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(14,165,233,0.3)]"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Đang lưu..." : "Lưu bài tập"}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Editor Body Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Form Editor */}
        <div
          className={`w-full lg:w-[50%] overflow-y-auto p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-cypher-border flex flex-col gap-6 ${
            activeTab === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          {error && (
            <div className="cyber-panel p-4 rounded-xl flex items-center gap-3 bg-red-500/10 border-red-500/30 text-red-500">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-bold font-mono">LỖI: {error}</span>
            </div>
          )}

          <div className="flex flex-col gap-6">
            {/* General Info */}
            <div className="flex flex-col gap-4">
              <h3 className="soft-section-title">Thông tin chung</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="soft-label">Mã bài tập (ID)</label>
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="vi-du-co-ban"
                    className="soft-input font-mono text-sm text-cypher-cyan font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="soft-label">Tên bài tập</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tên bài tập..."
                    className="soft-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="soft-label">Phân nhóm bài tập</label>
                  <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="Ví dụ: Cơ bản, HSG Tỉnh..."
                    className="soft-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="soft-label">Thể loại / Dạng bài</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ví dụ: Quy hoạch động, Toán..."
                    className="soft-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="soft-label flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cypher-cyan" /> Giới hạn thời gian (ms)
                  </label>
                  <input
                    type="number"
                    value={timeLimitMs}
                    onChange={(e) => setTimeLimitMs(Number(e.target.value))}
                    min={1}
                    className="soft-input font-mono font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="soft-label flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cypher-cyan" /> Giới hạn bộ nhớ (MB)
                  </label>
                  <input
                    type="number"
                    value={memoryLimitMb}
                    onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                    min={1}
                    className="soft-input font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Markdown + LaTeX Fields with Quick Toolbar */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-cypher-border/40 pb-2">
                <h3 className="soft-section-title border-0 p-0">Nội dung bài tập (Markdown & LaTeX)</h3>
              </div>

              {/* Quick Snippet Insert Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-cypher-surface rounded-xl border border-cypher-border text-xs">
                <span className="text-[10px] font-bold text-cypher-muted font-mono uppercase mr-1">Chèn nhanh:</span>
                <button
                  type="button"
                  onClick={() => insertSnippet(" $x$ ")}
                  className="px-2 py-1 rounded bg-cypher-cyan/10 text-cypher-cyan border border-cypher-cyan/20 font-mono font-bold hover:bg-cypher-cyan/20"
                  title="Công thức Inline LaTeX ($x$)"
                >
                  <Sigma className="w-3 h-3 inline mr-1" /> $x$
                </button>

                <button
                  type="button"
                  onClick={() => insertSnippet("\n$$\nE = mc^2\n$$\n")}
                  className="px-2 py-1 rounded bg-cypher-purple/10 text-cypher-purple border border-cypher-purple/20 font-mono font-bold hover:bg-cypher-purple/20"
                  title="Công thức Block LaTeX ($$E=mc^2$$)"
                >
                  $$ Block $$
                </button>

                <button
                  type="button"
                  onClick={() => insertSnippet("\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n```\n")}
                  className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold hover:bg-emerald-500/20"
                  title="Khối Code C++"
                >
                  <Code className="w-3 h-3 inline mr-1" /> ```cpp
                </button>

                <button
                  type="button"
                  onClick={() => insertSnippet("\n| Cột 1 | Cột 2 |\n| --- | --- |\n| Giá trị 1 | Giá trị 2 |\n")}
                  className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold hover:bg-amber-500/20"
                  title="Bảng Markdown"
                >
                  <Table className="w-3 h-3 inline mr-1" /> Bảng
                </button>

                <button
                  type="button"
                  onClick={() => insertSnippet(" **in đậm** ")}
                  className="px-2 py-1 rounded bg-cypher-surface border border-cypher-border font-bold hover:text-cypher-cyan"
                  title="In đậm"
                >
                  <Bold className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => insertSnippet(" *in nghiêng* ")}
                  className="px-2 py-1 rounded bg-cypher-surface border border-cypher-border italic hover:text-cypher-cyan"
                  title="In nghiêng"
                >
                  <Italic className="w-3 h-3" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="soft-label">Đề bài (Statement)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={9}
                  placeholder="Viết đề bài bằng Markdown & LaTeX..."
                  className="soft-input soft-textarea font-mono"
                />
              </div>
            </div>

            {/* Input/Output Format */}
            <div className="flex flex-col gap-4">
              <h3 className="soft-section-title">Định dạng dữ liệu (I/O Format)</h3>

              <div className="flex flex-col gap-1.5">
                <label className="soft-label">Input Format — Định dạng đầu vào</label>
                <textarea
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  rows={4}
                  placeholder="Mô tả dữ liệu đầu vào..."
                  className="soft-input soft-textarea font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="soft-label">Output Format — Định dạng đầu ra</label>
                <textarea
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  rows={4}
                  placeholder="Mô tả kết quả đầu ra..."
                  className="soft-input soft-textarea font-mono"
                />
              </div>
            </div>

            {/* Sample Input/Output */}
            <div className="flex flex-col gap-4">
              <h3 className="soft-section-title">Ví dụ minh họa (Sample Cases)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="soft-label">Sample Input</label>
                  <textarea
                    value={sampleInput}
                    onChange={(e) => handleSampleChange("input", e.target.value)}
                    rows={4}
                    placeholder="Dữ liệu mẫu đầu vào..."
                    className="soft-input soft-textarea font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="soft-label">Sample Output</label>
                  <textarea
                    value={sampleOutput}
                    onChange={(e) => handleSampleChange("output", e.target.value)}
                    rows={4}
                    placeholder="Kết quả mẫu đầu ra..."
                    className="soft-input soft-textarea font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Subtask configuration */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-cypher-border/40 pb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-cypher-cyan">
                  Cấu hình thang điểm
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-cypher-muted font-bold font-mono">Chia Subtasks:</span>
                  <button
                    type="button"
                    onClick={() => setIsSubtask(!isSubtask)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isSubtask ? "bg-cypher-cyan" : "bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow transition duration-200 ease-in-out ${
                        isSubtask ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {isSubtask ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-cypher-surface p-3.5 rounded-xl border border-cypher-border">
                    <span className="text-xs text-cypher-muted">
                      Số Subtasks: <strong className="text-foreground font-mono">{subtasks.length}</strong>
                    </span>
                    <span className="text-xs text-cypher-muted">
                      Tổng điểm:{" "}
                      <strong className={`font-mono font-bold ${totalPoints === 100 ? "text-green-500" : "text-cypher-cyan"}`}>
                        {totalPoints}đ
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={addSubtask}
                      className="inline-flex items-center gap-1 text-xs text-cypher-cyan font-bold hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm Subtask
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {subtasks.map((sub, index) => (
                      <div key={index} className="cyber-panel p-4 rounded-xl flex items-center justify-between bg-cypher-surface/40 gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-cypher-muted uppercase font-mono">Tên/Điều kiện Subtask</label>
                            <input
                              type="text"
                              value={sub.label}
                              onChange={(e) => handleSubtaskChange(index, "label", e.target.value)}
                              className="px-2.5 py-1.5 border border-cypher-border rounded-lg bg-cypher-surface focus:outline-none focus:border-cypher-cyan text-xs font-bold"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-cypher-muted uppercase font-mono">Điểm số</label>
                            <input
                              type="number"
                              value={sub.points}
                              onChange={(e) => handleSubtaskChange(index, "points", e.target.value)}
                              className="px-2.5 py-1.5 border border-cypher-border rounded-lg bg-cypher-surface focus:outline-none focus:border-cypher-cyan text-xs font-mono font-bold"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSubtask(index)}
                          className="p-2 border border-red-500/20 hover:border-red-500 hover:text-red-500 rounded-lg text-red-500/60 transition-colors self-center"
                          title="Xóa Subtask"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-cypher-surface p-4 rounded-xl border border-cypher-border text-center text-xs text-cypher-muted font-medium">
                  Chế độ Subtask tắt. Đề bài chấm theo thang điểm mặc định <span className="text-cypher-cyan font-bold">100đ</span>.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Live Markdown & LaTeX Preview */}
        <div
          className={`flex-grow lg:w-[50%] overflow-y-auto p-4 sm:p-6 lg:p-8 bg-cypher-surface/20 flex flex-col gap-6 ${
            activeTab === "edit" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="border-b border-cypher-border/60 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-cypher-cyan flex items-center gap-2">
                <Edit className="w-4 h-4" /> Xem trước trực tiếp (Live Preview)
              </h3>
              <p className="text-xs text-cypher-muted mt-0.5">
                Hiển thị kết quả Markdown & LaTeX được render ngay lập tức.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8 max-w-4xl">
            {/* Title Render */}
            <div className="cyber-panel p-6 rounded-2xl border-l-4 border-l-cypher-cyan shadow-sm">
              <span className="cyber-badge-cyan">{group || category || "Bài tập"}</span>
              <h2 className="text-2xl font-black mt-2 text-foreground">{title || "Tên bài tập..."}</h2>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-cypher-muted font-mono">
                <span>Thời gian: <strong className="text-foreground">{timeLimitMs} ms</strong></span>
                <span>Bộ nhớ: <strong className="text-foreground">{memoryLimitMb} MB</strong></span>
                <span>Điểm: <strong className="text-cypher-cyan">{totalPoints}đ</strong></span>
              </div>
            </div>

            {/* Statement Preview */}
            <div className="flex flex-col gap-2">
              <span className="soft-label">Đề bài</span>
              <div className="cyber-panel p-6 rounded-2xl shadow-sm">
                {content ? <MarkdownRenderer content={content} /> : <span className="text-sm italic text-cypher-muted">Chưa có nội dung đề bài...</span>}
              </div>
            </div>

            {/* I/O Format Preview */}
            {(inputFormat || outputFormat) && (
              <div className="flex flex-col gap-4">
                {inputFormat && (
                  <div className="flex flex-col gap-2">
                    <span className="soft-label">Input Format</span>
                    <div className="cyber-panel p-5 rounded-2xl shadow-sm">
                      <MarkdownRenderer content={inputFormat} />
                    </div>
                  </div>
                )}
                {outputFormat && (
                  <div className="flex flex-col gap-2">
                    <span className="soft-label">Output Format</span>
                    <div className="cyber-panel p-5 rounded-2xl shadow-sm">
                      <MarkdownRenderer content={outputFormat} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sample Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="soft-label">Sample Input</span>
                <pre className="bg-zinc-950/90 p-4 rounded-xl border border-cypher-border font-mono text-xs text-zinc-200 max-h-[200px] overflow-y-auto leading-relaxed">
                  {sampleInput || "[Trống]"}
                </pre>
              </div>
              <div className="flex flex-col gap-2">
                <span className="soft-label">Sample Output</span>
                <pre className="bg-zinc-950/90 p-4 rounded-xl border border-cypher-border font-mono text-xs text-zinc-200 max-h-[200px] overflow-y-auto leading-relaxed">
                  {sampleOutput || "[Trống]"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
