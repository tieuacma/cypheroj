"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, ChevronLeft, ShieldAlert, Cpu, Clock, Edit, Plus, Trash2 } from "lucide-react";
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

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const PROBLEM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

    // Frontend validations
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-cypher-border bg-cypher-surface/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/problems" className="flex items-center gap-1.5 text-sm font-medium text-cypher-muted hover:text-cypher-cyan transition-colors">
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </Link>
            <span className="text-cypher-border/60">|</span>
            <span className="text-sm text-cypher-muted">
              Tạo bài tập mới
            </span>
          </div>

          <span className="text-lg font-semibold tracking-tight text-shimmer hidden md:inline">
            Cypher<span className="text-cypher-cyan">.Creator</span>
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="soft-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
        {/* Left Side: Form Editor (Scrollable) */}
        <div className="w-full lg:w-[50%] overflow-y-auto p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-cypher-border flex flex-col gap-6">
          {error && (
            <div className="cyber-panel p-5 rounded-2xl flex items-center gap-3 bg-red-500/5 border-red-500/20 text-red-500">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-bold tracking-tight leading-normal">
                LỖI: {error}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-5">
            {/* General Info */}
            <div className="flex flex-col gap-4">
              <h3 className="soft-section-title">
                Thông tin chung
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="soft-label">Mã bài tập (ID)</label>
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="ví-du-viet-lien-khong-dau"
                    className="soft-input font-mono text-sm"
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
                    placeholder="Ví dụ: Cơ bản, Đồ thị..."
                    className="soft-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="soft-label">Thể loại / Dạng bài</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ví dụ: Quy hoạch động, Toán học..."
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
                    className="soft-input font-mono"
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
                    className="soft-input font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Markdown + LaTeX Fields */}
            <div className="flex flex-col gap-4">
              <h3 className="soft-section-title flex items-center justify-between">
                <span>Nội dung bài tập</span>
                <span className="text-[11px] text-cypher-muted font-normal">Hỗ trợ Markdown & LaTeX</span>
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="soft-label">Đề bài (Statement)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder="Viết đề bài bằng markdown..."
                  className="soft-input soft-textarea"
                />
              </div>
            </div>

            {/* Input/Output Format */}
            <div className="flex flex-col gap-4">
              <h3 className="soft-section-title">
                Định dạng dữ liệu (I/O Format)
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="soft-label">Input Format — Định dạng đầu vào</label>
                <textarea
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  rows={5}
                  placeholder="Mô tả định dạng dữ liệu đầu vào. Ví dụ: Dòng đầu chứa số nguyên N (1 ≤ N ≤ 10⁵)..."
                  className="soft-input soft-textarea"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="soft-label">Output Format — Định dạng đầu ra</label>
                <textarea
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  rows={5}
                  placeholder="Mô tả định dạng kết quả đầu ra. Ví dụ: In ra một số nguyên duy nhất..."
                  className="soft-input soft-textarea"
                />
              </div>
            </div>

            {/* Sample Input/Output */}
            <div className="flex flex-col gap-4">
              <h3 className="soft-section-title">
                Ví dụ minh họa (Sample Case)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="soft-label">Sample Input</label>
                  <textarea
                    value={sampleInput}
                    onChange={(e) => handleSampleChange("input", e.target.value)}
                    rows={4}
                    placeholder="Dữ liệu đầu vào mẫu..."
                    className="soft-input soft-textarea text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="soft-label">Sample Output</label>
                  <textarea
                    value={sampleOutput}
                    onChange={(e) => handleSampleChange("output", e.target.value)}
                    rows={4}
                    placeholder="Kết quả đầu ra mẫu..."
                    className="soft-input soft-textarea text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Subtask configuration */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-cypher-border/40 pb-1.5">
                <h3 className="text-xs font-black uppercase tracking-widest text-cypher-cyan">
                  Cấu hình điểm số bài tập
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-cypher-muted font-bold font-mono">Chia Subtasks:</span>
                  <button
                    type="button"
                    onClick={() => setIsSubtask(!isSubtask)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isSubtask ? "bg-cypher-cyan" : "bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                        isSubtask ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {isSubtask ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-cypher-surface/20 p-3.5 rounded-xl border border-cypher-border">
                    <span className="text-xs text-cypher-muted">
                      Tổng số subtask: <strong className="text-foreground">{subtasks.length}</strong>
                    </span>
                    <span className="text-xs text-cypher-muted">
                      Tổng điểm: <strong className="text-cypher-cyan">{totalPoints}</strong>
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
                          className="p-2 border border-red-500/20 hover:border-red-500 hover:text-red-500 rounded-lg text-red-500/60 transition-colors self-end sm:self-center"
                          title="Xóa Subtask"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-cypher-surface/20 p-4.5 rounded-xl border border-cypher-border text-center text-xs text-cypher-muted font-semibold">
                  Chế độ Subtask tắt. Bài tập sẽ được chấm toàn bộ với thang điểm mặc định <span className="text-cypher-cyan font-bold">100đ</span>.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Live Markdown & LaTeX Preview (Scrollable) */}
        <div className="flex-grow lg:w-[50%] overflow-y-auto p-4 sm:p-6 lg:p-8 bg-cypher-surface/20 flex flex-col gap-6">
          <div className="border-b border-cypher-border/60 pb-3">
            <h3 className="text-sm font-semibold text-cypher-cyan flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Xem trước đề bài
            </h3>
            <p className="text-xs text-cypher-muted mt-1">
              Hiển thị trực tiếp nội dung markdown và công thức LaTeX.
            </p>
          </div>

          <div className="flex flex-col gap-8 max-w-4xl">
            {/* Title Render */}
            <div className="cyber-panel p-5 rounded-2xl border-l-[3px] border-l-cypher-cyan">
              <span className="soft-badge">
                {group || category || "Bài tập"}
              </span>
              <h2 className="text-2xl soft-heading mt-2 text-foreground">{title || "Chưa đặt tên"}</h2>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-cypher-muted">
                <span>Thời gian: <strong className="text-foreground font-medium">{timeLimitMs} ms</strong></span>
                <span>Bộ nhớ: <strong className="text-foreground font-medium">{memoryLimitMb} MB</strong></span>
                <span>Điểm: <strong className="text-cypher-cyan font-medium">{totalPoints}đ</strong></span>
              </div>
            </div>

            {/* Statement Preview */}
            <div className="flex flex-col gap-2">
              <span className="soft-label">Nội dung đề bài</span>
              <div className="cyber-panel p-5 rounded-xl">
                {content ? <MarkdownRenderer content={content} /> : <span className="text-sm italic text-cypher-muted">Đang trống...</span>}
              </div>
            </div>

            {/* I/O Format Preview */}
            {(inputFormat || outputFormat) && (
              <div className="flex flex-col gap-4">
                {inputFormat && (
                  <div className="flex flex-col gap-2">
                    <span className="soft-label">Input Format</span>
                    <div className="cyber-panel p-4 rounded-xl">
                      <MarkdownRenderer content={inputFormat} />
                    </div>
                  </div>
                )}
                {outputFormat && (
                  <div className="flex flex-col gap-2">
                    <span className="soft-label">Output Format</span>
                    <div className="cyber-panel p-4 rounded-xl">
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
                <pre className="bg-zinc-950/70 dark:bg-zinc-950/90 p-4 rounded-xl border border-cypher-border font-mono text-xs text-zinc-300 max-h-[200px] overflow-y-auto leading-relaxed">
                  {sampleInput || "[Trống]"}
                </pre>
              </div>
              <div className="flex flex-col gap-2">
                <span className="soft-label">Sample Output</span>
                <pre className="bg-zinc-950/70 dark:bg-zinc-950/90 p-4 rounded-xl border border-cypher-border font-mono text-xs text-zinc-300 max-h-[200px] overflow-y-auto leading-relaxed">
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
