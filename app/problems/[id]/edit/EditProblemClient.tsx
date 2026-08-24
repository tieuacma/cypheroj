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
  KeyRound,
  Lock,
  Gauge,
} from "lucide-react";
import { updateProblemAction } from "@/lib/actions/problems";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminKeyModal } from "@/components/AdminKeyModal";
import type { SerializedProblem } from "@/lib/actions/problems";
import type { SubtaskConfig } from "@/lib/db/types";

interface EditProblemClientProps {
  problem: SerializedProblem;
}

export function EditProblemClient({ problem }: EditProblemClientProps) {
  const router = useRouter();

  const [id, setId] = useState(problem.id);
  const [title, setTitle] = useState(problem.title);
  const [category, setCategory] = useState(problem.category || "General");
  const [group, setGroup] = useState(problem.group || "");

  const [timeLimitMs, setTimeLimitMs] = useState(problem.time_limit_ms);
  const [memoryLimitMb, setMemoryLimitMb] = useState(problem.memory_limit_mb);
  const [eloRating, setEloRating] = useState(problem.elo_rating ?? 1000);
  const [content, setContent] = useState(problem.content);
  const [inputFormat, setInputFormat] = useState(problem.input_format ?? "");
  const [outputFormat, setOutputFormat] = useState(problem.output_format ?? "");
  const [sampleInput, setSampleInput] = useState(problem.sample_input);
  const [sampleOutput, setSampleOutput] = useState(problem.sample_output);
  const [isSubtask, setIsSubtask] = useState(problem.is_subtask);
  const [subtasks, setSubtasks] = useState<SubtaskConfig[]>(problem.subtasks || []);

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Admin Key security states
  const [verifiedAdminKey, setVerifiedAdminKey] = useState<string | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(true); // Open initially to protect edit page

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

  const performSave = async (keyToUse: string) => {
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
      const payload = {
        id: normalizedId,
        title: title.trim(),
        content: content.trim(),
        input_format: inputFormat.trim(),
        output_format: outputFormat.trim(),
        category: category.trim(),
        group: group.trim(),
        sample_input: sampleInput,
        sample_output: sampleOutput,
        time_limit_ms: timeLimitMs,
        memory_limit_mb: memoryLimitMb,
        elo_rating: eloRating,
        is_subtask: isSubtask,
        subtasks: isSubtask ? subtasks : [],
        adminKey: keyToUse,
      };

      // Call API directly to ensure HTTP error status handling for Admin Key & IP Ban
      const res = await fetch(`/api/problems/${problem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Không thể cập nhật bài tập.");
      }

      router.push(`/problems/${resData.id}`);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không thể cập nhật bài tập. Hãy kiểm tra kết nối Database.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (!verifiedAdminKey) {
      setIsAdminModalOpen(true);
    } else {
      performSave(verifiedAdminKey);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-sky-500/20">
      {/* Header */}
      <header className="border-b border-sky-500/15 bg-background/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/problems/${problem.id}`}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-sky-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại đề bài
            </Link>
            <span className="text-border">|</span>
            <span className="text-xs font-bold text-muted-foreground">
              Chỉnh sửa bài tập <span className="text-sky-500 font-mono font-extrabold">#{problem.id}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!verifiedAdminKey ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Chưa xác thực Key
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> Đã mở khóa Admin
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Editor Body Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Form Editor */}
        <div
          className={`w-full lg:w-[50%] overflow-y-auto p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-border flex flex-col gap-6 ${
            activeTab === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          {!verifiedAdminKey && (
            <div className="p-4 rounded-2xl flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-2 text-xs font-bold">
                <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
                <span>Yêu cầu xác thực Key Admin để lưu các chỉnh sửa cho bài tập này.</span>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider shrink-0 hover:bg-amber-400 transition-all"
              >
                Nhập Key
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold font-mono">LỖI: {error}</span>
            </div>
          )}

          <div className="flex flex-col gap-6">
            {/* General Info */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-sky-500 border-b border-border pb-2">
                Thông tin chung
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Mã bài tập (ID)</label>
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-card font-mono text-sm text-sky-500 font-extrabold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Tên bài tập</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm font-extrabold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Phân nhóm bài tập</label>
                  <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="Ví dụ: Cơ bản, HSG Tỉnh..."
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Thể loại / Dạng bài</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ví dụ: Quy hoạch động, Toán..."
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-500" /> Thời gian (ms)
                    </label>
                    <input
                      type="number"
                      value={timeLimitMs}
                      onChange={(e) => setTimeLimitMs(Number(e.target.value))}
                      min={1}
                      className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm font-mono font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-sky-500" /> Bộ nhớ (MB)
                    </label>
                    <input
                      type="number"
                      value={memoryLimitMb}
                      onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                      min={1}
                      className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm font-mono font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

              <div className="flex flex-col gap-1.5 md:w-1/2">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-sky-500" /> Hệ số Elo
                </label>
                <input
                  type="number"
                  value={eloRating}
                  onChange={(e) => setEloRating(Number(e.target.value))}
                  min={100}
                  max={3000}
                  step={50}
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm font-mono font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-[11px] text-muted-foreground">Mức độ khó đề xuất, từ 100 đến 3000.</span>
              </div>

            </div>

            {/* Markdown + LaTeX Fields with Quick Toolbar */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-sky-500 border-b border-border pb-2">
                Nội dung bài tập (Markdown & LaTeX)
              </h3>

              {/* Quick Snippet Insert Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-card rounded-2xl border border-border text-xs">
                <span className="text-[10px] font-bold text-muted-foreground font-mono uppercase mr-1">Chèn nhanh:</span>
                <button
                  type="button"
                  onClick={() => insertSnippet(" $x$ ")}
                  className="px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 font-mono font-bold hover:bg-sky-500/20"
                >
                  <Sigma className="w-3 h-3 inline mr-1" /> $x$
                </button>

                <button
                  type="button"
                  onClick={() => insertSnippet("\n$$\nE = mc^2\n$$\n")}
                  className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 font-mono font-bold hover:bg-purple-500/20"
                >
                  $$ Block $$
                </button>

                <button
                  type="button"
                  onClick={() => insertSnippet("\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n```\n")}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono font-bold hover:bg-emerald-500/20"
                >
                  <Code className="w-3 h-3 inline mr-1" /> ```cpp
                </button>

                <button
                  type="button"
                  onClick={() => insertSnippet("\n| Cột 1 | Cột 2 |\n| --- | --- |\n| Giá trị 1 | Giá trị 2 |\n")}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono font-bold hover:bg-amber-500/20"
                >
                  <Table className="w-3 h-3 inline mr-1" /> Bảng
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Nội dung Đề bài (Statement)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={9}
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-mono focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Input/Output Format */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-sky-500 border-b border-border pb-2">
                Định dạng dữ liệu (I/O Format)
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Input Format — Đầu vào</label>
                <textarea
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  rows={4}
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-mono focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Output Format — Đầu ra</label>
                <textarea
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  rows={4}
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-mono focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>
            </div>

            {/* Sample Cases */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-sky-500 border-b border-border pb-2">
                Ví dụ minh họa (Sample Cases)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Sample Input</label>
                  <textarea
                    value={sampleInput}
                    onChange={(e) => handleSampleChange("input", e.target.value)}
                    rows={4}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-mono focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Sample Output</label>
                  <textarea
                    value={sampleOutput}
                    onChange={(e) => handleSampleChange("output", e.target.value)}
                    rows={4}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-mono focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Subtask configuration */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-sky-500">
                  Cấu hình thang điểm
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-bold font-mono">Chia Subtasks:</span>
                  <button
                    type="button"
                    onClick={() => setIsSubtask(!isSubtask)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isSubtask ? "bg-sky-500" : "bg-zinc-800"
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
                  <div className="flex justify-between items-center bg-card p-3.5 rounded-2xl border border-border text-xs">
                    <span className="text-muted-foreground">
                      Số Subtasks: <strong className="text-foreground font-mono">{subtasks.length}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Tổng điểm:{" "}
                      <strong className={`font-mono font-bold ${totalPoints === 100 ? "text-emerald-500" : "text-sky-500"}`}>
                        {totalPoints}đ
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={addSubtask}
                      className="inline-flex items-center gap-1 text-sky-500 font-bold hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm Subtask
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {subtasks.map((sub, index) => (
                      <div key={index} className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase font-mono">Tên/Điều kiện Subtask</label>
                            <input
                              type="text"
                              value={sub.label}
                              onChange={(e) => handleSubtaskChange(index, "label", e.target.value)}
                              className="px-2.5 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:border-sky-500 text-xs font-bold"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase font-mono">Điểm số</label>
                            <input
                              type="number"
                              value={sub.points}
                              onChange={(e) => handleSubtaskChange(index, "points", e.target.value)}
                              className="px-2.5 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:border-sky-500 text-xs font-mono font-bold"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSubtask(index)}
                          className="p-2 border border-rose-500/20 hover:border-rose-500 hover:text-rose-500 rounded-xl text-rose-500/60 transition-colors self-center"
                          title="Xóa Subtask"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-card p-4 rounded-2xl border border-border text-center text-xs text-muted-foreground font-medium">
                  Chế độ Subtask tắt. Đề bài chấm theo thang điểm mặc định <span className="text-sky-500 font-bold">100đ</span>.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Live Markdown & LaTeX Preview */}
        <div
          className={`flex-grow lg:w-[50%] overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/20 flex flex-col gap-6 ${
            activeTab === "edit" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-sky-500 flex items-center gap-2">
                <Edit className="w-4 h-4" /> Xem trước trực tiếp (Live Preview)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Hiển thị kết quả Markdown & LaTeX được render ngay lập tức.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8 max-w-4xl">
            {/* Title Render */}
            <div className="p-6 rounded-3xl border border-sky-500/20 bg-card shadow-sm border-l-4 border-l-sky-500">
              <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20 text-xs font-bold">
                {group || category || "Bài tập"}
              </span>
              <h2 className="text-2xl font-black mt-2 text-foreground">{title || "Tên bài tập..."}</h2>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground font-mono">
                <span>Thời gian: <strong className="text-foreground">{timeLimitMs} ms</strong></span>
                <span>Bộ nhớ: <strong className="text-foreground">{memoryLimitMb} MB</strong></span>
                <span>Điểm: <strong className="text-sky-500 font-bold">{totalPoints}đ</strong></span>
              </div>
            </div>

            {/* Statement Preview */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-muted-foreground">Đề bài</span>
              <div className="p-6 rounded-3xl border border-sky-500/15 bg-card shadow-sm">
                {content ? <MarkdownRenderer content={content} /> : <span className="text-sm italic text-muted-foreground">Chưa có nội dung đề bài...</span>}
              </div>
            </div>

            {/* I/O Format Preview */}
            {(inputFormat || outputFormat) && (
              <div className="flex flex-col gap-4">
                {inputFormat && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Input Format</span>
                    <div className="p-5 rounded-3xl border border-sky-500/15 bg-card shadow-sm">
                      <MarkdownRenderer content={inputFormat} />
                    </div>
                  </div>
                )}
                {outputFormat && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Output Format</span>
                    <div className="p-5 rounded-3xl border border-sky-500/15 bg-card shadow-sm">
                      <MarkdownRenderer content={outputFormat} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sample Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-muted-foreground">Sample Input</span>
                <pre className="bg-zinc-100 dark:bg-zinc-950 p-4 rounded-2xl border border-border font-mono text-xs text-zinc-800 dark:text-zinc-200 max-h-[200px] overflow-y-auto leading-relaxed">
                  {sampleInput || "[Trống]"}
                </pre>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-muted-foreground">Sample Output</span>
                <pre className="bg-zinc-100 dark:bg-zinc-950 p-4 rounded-2xl border border-border font-mono text-xs text-zinc-800 dark:text-zinc-200 max-h-[200px] overflow-y-auto leading-relaxed">
                  {sampleOutput || "[Trống]"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Key Protection Modal */}
      <AdminKeyModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={(key) => {
          setVerifiedAdminKey(key);
          setIsAdminModalOpen(false);
        }}
      />
    </div>
  );
}
