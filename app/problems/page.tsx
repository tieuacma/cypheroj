"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Edit,
  Search,
  Plus,
  LayoutGrid,
  List,
  Clock,
  Cpu,
  Tag,
  ArrowUpDown,
  X,
  Code2,
  BookOpen,
  GraduationCap,
  Sparkles,
  Gauge,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DbProblem } from "@/lib/db/types";

type ViewMode = "table" | "grid";
type SortOption = "id" | "title" | "time" | "memory";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<DbProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [minElo, setMinElo] = useState<number | "">("");
  const [maxElo, setMaxElo] = useState<number | "">("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortBy, setSortBy] = useState<SortOption>("id");

  useEffect(() => {
    fetch("/api/problems")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải danh sách bài tập.");
        return res.json();
      })
      .then((data) => {
        setProblems(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
        setIsLoading(false);
      });
  }, []);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(problems.map((p) => p.category).filter(Boolean)))];
  }, [problems]);

  // Filter and sort problems
  const filteredAndSorted = useMemo(() => {
    const filtered = problems.filter((prob) => {
      const matchesSearch =
        prob.title.toLowerCase().includes(search.toLowerCase()) ||
        prob.id.toLowerCase().includes(search.toLowerCase()) ||
        (prob.category?.toLowerCase() || "").includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || prob.category === selectedCategory;

      const elo = prob.elo_rating ?? 1000;
      const matchesMinElo = minElo === "" || elo >= minElo;
      const matchesMaxElo = maxElo === "" || elo <= maxElo;

      return matchesSearch && matchesCategory && matchesMinElo && matchesMaxElo;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "time") return a.time_limit_ms - b.time_limit_ms;
      if (sortBy === "memory") return a.memory_limit_mb - b.memory_limit_mb;
      return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: "base" });
    });
  }, [problems, search, minElo, maxElo, selectedCategory, sortBy]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-sky-500/20">
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col gap-6">
            {/* Page Title & Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/60 pb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5">
                  <BookOpen className="w-7 h-7 text-sky-500" />
                  Kho Bài Tập Lập Trình Học Sinh
                </h1>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  Chọn đề bài tập phù hợp, viết code C++ và kiểm tra độ chính xác của thuật toán.
                </p>
              </div>

              <Link
                href="/problems/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-extrabold text-xs md:text-sm uppercase tracking-wider hover:opacity-95 shadow-md shadow-sky-500/20 hover:scale-105 transition-all w-full md:w-auto justify-center"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Tạo bài tập mới
              </Link>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Search className="h-4.5 w-4.5 text-sky-500" />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo Mã ID, Tên bài tập, Thể loại..."
                    className="block w-full pl-10 pr-10 py-2.5 border border-sky-500/20 rounded-2xl bg-card placeholder-muted-foreground text-foreground focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-sm transition-all shadow-sm"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Right controls: Sort + View Mode Switcher */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  {/* Sort dropdown */}
                  <div className="flex items-center gap-2 border border-sky-500/20 rounded-2xl px-3 py-2 bg-card text-sm">
                    <ArrowUpDown className="w-4 h-4 text-sky-500" />
                    <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">Sắp xếp:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                    >
                      <option value="id">Theo Mã ID</option>
                      <option value="title">Theo Tên bài tập</option>
                      <option value="time">Theo Giới hạn thời gian</option>
                      <option value="memory">Theo Giới hạn bộ nhớ</option>
                    </select>
                  </div>

                  {/* View mode toggle */}
                  <div className="flex items-center p-1 bg-card border border-sky-500/20 rounded-2xl">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        viewMode === "table"
                          ? "bg-sky-500 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Chế độ Bảng"
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden sm:inline">Bảng</span>
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        viewMode === "grid"
                          ? "bg-sky-500 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Chế độ Thẻ"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="hidden sm:inline">Thẻ</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                  <Gauge className="w-4 h-4" /> Lọc theo Elo
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    min={100}
                    max={3000}
                    step={50}
                    value={minElo}
                    onChange={(e) => setMinElo(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Từ"
                    aria-label="Elo tối thiểu"
                    className="w-full sm:w-28 px-3 py-2 rounded-xl border border-amber-500/25 bg-card text-sm font-mono font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                  />
                  <span className="text-xs text-muted-foreground">đến</span>
                  <input
                    type="number"
                    min={100}
                    max={3000}
                    step={50}
                    value={maxElo}
                    onChange={(e) => setMaxElo(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Đến"
                    aria-label="Elo tối đa"
                    className="w-full sm:w-28 px-3 py-2 rounded-xl border border-amber-500/25 bg-card text-sm font-mono font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                  />
                </div>
                {(minElo !== "" || maxElo !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setMinElo("");
                      setMaxElo("");
                    }}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Xóa lọc
                  </button>
                )}
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1 shrink-0 mr-1">
                  <Tag className="w-3.5 h-3.5 text-sky-500" /> Thể loại:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedCategory === cat
                        ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                        : "bg-card text-muted-foreground border-sky-500/20 hover:border-sky-500/40 hover:text-foreground"
                    }`}
                  >
                    {cat === "all" ? "Tất cả bài tập" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Content: Table or Grid */}
            {isLoading ? (
              <div className="p-6 bg-card rounded-3xl border border-sky-500/20">
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-border/40 last:border-0">
                      <Skeleton className="h-8 w-16 rounded-xl" />
                      <Skeleton className="h-8 flex-1 rounded-xl" />
                      <Skeleton className="h-8 w-24 rounded-xl hidden sm:block" />
                      <Skeleton className="h-8 w-20 rounded-xl hidden md:block" />
                      <Skeleton className="h-8 w-16 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <EmptyState
                type="error"
                title="Lỗi tải dữ liệu bài tập"
                description={error}
                actionLabel="Thử lại"
                onAction={() => window.location.reload()}
              />
            ) : filteredAndSorted.length === 0 ? (
              <EmptyState
                type="search"
                title="Không tìm thấy bài tập nào"
                description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc thể loại"
              />
            ) : viewMode === "table" ? (
              /* Table View */
              <div className="rounded-3xl border border-sky-500/20 overflow-hidden shadow-lg bg-card">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/40">
                      <tr>
                        <th scope="col" className="px-4 md:px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground w-24">
                          Mã ID
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                          Tên bài tập
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                          Thể loại
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wider text-muted-foreground hidden md:table-cell w-24">
                          Elo
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wider text-muted-foreground w-28">
                          Thời gian
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wider text-muted-foreground w-28">
                          Bộ nhớ
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wider text-muted-foreground w-24">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium text-xs">
                      {filteredAndSorted.map((prob) => (
                        <tr
                          key={prob.id}
                          className="hover:bg-sky-500/5 transition-all duration-150 group"
                        >
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap font-bold text-sky-500 font-mono text-sm">
                            #{prob.id}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-extrabold text-foreground">
                            <Link href={`/problems/${prob.id}`} className="hover:text-sky-500 transition-colors flex items-center gap-2">
                              <span>{prob.title}</span>
                            </Link>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-muted-foreground hidden sm:table-cell">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
                              {prob.category || "Căn bản"}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center hidden md:table-cell">
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono font-black">
                              <Gauge className="w-3.5 h-3.5" /> {prob.elo_rating ?? 1000}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center text-xs font-mono font-bold">
                            {prob.time_limit_ms} ms
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center text-xs font-mono font-bold">
                            {prob.memory_limit_mb} MB
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                            <Link
                              href={`/problems/${prob.id}/edit`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-500/20 hover:border-sky-500 hover:text-sky-500 text-xs font-bold transition-all bg-card shadow-sm"
                              title="Chỉnh sửa đề bài (Yêu cầu Key Admin)"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Sửa</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid View Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSorted.map((prob) => (
                  <div
                    key={prob.id}
                    className="p-6 rounded-3xl border border-sky-500/20 bg-card flex flex-col justify-between gap-5 relative group hover:border-sky-500/50 shadow-md transition-all"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-sky-500">
                          #{prob.id}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
                          {prob.category || "Căn bản"}
                        </span>
                      </div>

                      <Link href={`/problems/${prob.id}`} className="group-hover:text-sky-500 transition-colors">
                        <h3 className="text-base font-extrabold text-foreground leading-snug line-clamp-2">
                          {prob.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-border/60 pt-4">
                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                        <span className="flex items-center gap-1 font-bold">
                          <Clock className="w-3.5 h-3.5 text-sky-500" /> {prob.time_limit_ms} ms
                        </span>
                        <span className="flex items-center gap-1 font-bold">
                          <Cpu className="w-3.5 h-3.5 text-sky-500" /> {prob.memory_limit_mb} MB
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                        <Gauge className="w-3.5 h-3.5" /> Elo {prob.elo_rating ?? 1000}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/problems/${prob.id}`}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider text-center hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Code2 className="w-4 h-4" /> Bắt đầu giải
                        </Link>
                        <Link
                          href={`/problems/${prob.id}/edit`}
                          className="p-2.5 rounded-xl border border-sky-500/20 hover:border-sky-500 hover:text-sky-500 transition-all text-muted-foreground bg-card"
                          title="Chỉnh sửa (Key Admin)"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 border-t border-border text-center text-xs text-muted-foreground mt-auto bg-muted/20">
          <p>© 2026 Cypher Code Academy. Nền tảng luyện tập lập trình C++ dành cho học sinh.</p>
        </footer>
      </div>
    </PageTransition>
  );
}
