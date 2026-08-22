"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Terminal,
  Edit,
  Search,
  Shield,
  Plus,
  LayoutGrid,
  List,
  Clock,
  Cpu,
  Tag,
  ArrowUpDown,
  X,
  Code2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";
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

      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "time") return a.time_limit_ms - b.time_limit_ms;
      if (sortBy === "memory") return a.memory_limit_mb - b.memory_limit_mb;
      return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: "base" });
    });
  }, [problems, search, selectedCategory, sortBy]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background cyber-grid text-foreground flex flex-col selection:bg-cypher-cyan/30">
        {/* Header */}
        <header className="border-b border-cypher-border bg-cypher-surface/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-cypher-cyan/10 border border-cypher-cyan flex items-center justify-center shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                <Terminal className="w-4.5 h-4.5 text-cypher-cyan" />
              </div>
              <span className="text-xl font-black tracking-widest text-shimmer">
                CYPHER<span className="text-cypher-cyan">.OJ</span>
              </span>
            </Link>

            <nav className="flex items-center gap-4 sm:gap-6">
              <Link href="/problems" className="text-sm font-semibold text-cypher-cyan border-b-2 border-cypher-cyan pb-1 hidden sm:block">
                Kho bài tập
              </Link>
              <ThemeToggle />
              <MobileMenu />
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col gap-6">
            {/* Page Title & Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-cypher-border/40 pb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase flex items-center gap-3">
                  <Shield className="w-7 h-7 text-cypher-cyan animate-pulse" />
                  Problem Database
                </h1>
                <p className="text-sm md:text-base text-cypher-muted mt-1.5 font-medium">
                  Select a tactical node, study constraints, and submit your binary solution.
                </p>
              </div>

              <Link
                href="/problems/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-xl bg-cypher-cyan text-zinc-950 font-black text-xs md:text-sm uppercase tracking-wider hover:bg-cypher-cyan/95 transition-all shadow-[0_0_25px_rgba(14,165,233,0.3)] hover:scale-105 border-2 border-transparent hover:border-cypher-cyan/30 w-full md:w-auto justify-center"
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
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cypher-muted">
                    <Search className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo ID, Tên bài tập, Thể loại..."
                    className="block w-full pl-10 pr-10 py-2.5 border border-cypher-border rounded-xl bg-cypher-surface placeholder-cypher-muted text-foreground focus:outline-none focus:border-cypher-cyan focus:ring-2 focus:ring-cypher-cyan/20 text-sm transition-all shadow-sm"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-cypher-muted hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Right controls: Sort + View Mode Switcher */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  {/* Sort dropdown */}
                  <div className="flex items-center gap-2 border border-cypher-border rounded-xl px-3 py-2 bg-cypher-surface text-sm">
                    <ArrowUpDown className="w-4 h-4 text-cypher-muted" />
                    <span className="text-xs text-cypher-muted font-medium hidden sm:inline">Sắp xếp:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                    >
                      <option value="id">Theo Mã ID</option>
                      <option value="title">Theo Tên bài tập</option>
                      <option value="time">Theo Giới hạn thời gian</option>
                      <option value="memory">Theo Giới hạn bộ nhớ</option>
                    </select>
                  </div>

                  {/* View mode toggle */}
                  <div className="flex items-center p-1 bg-cypher-surface border border-cypher-border rounded-xl">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        viewMode === "table"
                          ? "bg-cypher-cyan/20 text-cypher-cyan border border-cypher-cyan/40 shadow-sm"
                          : "text-cypher-muted hover:text-foreground"
                      }`}
                      title="Chế độ Bảng"
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden sm:inline">Bảng</span>
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        viewMode === "grid"
                          ? "bg-cypher-cyan/20 text-cypher-cyan border border-cypher-cyan/40 shadow-sm"
                          : "text-cypher-muted hover:text-foreground"
                      }`}
                      title="Chế độ Thẻ"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="hidden sm:inline">Thẻ</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-xs font-mono font-bold text-cypher-muted uppercase flex items-center gap-1 shrink-0 mr-1">
                  <Tag className="w-3.5 h-3.5" /> Thể loại:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                      selectedCategory === cat
                        ? "bg-cypher-cyan text-zinc-950 border-cypher-cyan font-bold shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                        : "bg-cypher-surface text-cypher-muted border-cypher-border hover:border-cypher-cyan/40 hover:text-foreground"
                    }`}
                  >
                    {cat === "all" ? "Tất cả" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Content: Table or Grid */}
            {isLoading ? (
              <div className="p-6 glass-panel rounded-2xl">
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-cypher-border/40 last:border-0">
                      <Skeleton className="h-8 w-16 rounded" />
                      <Skeleton className="h-8 flex-1 rounded" />
                      <Skeleton className="h-8 w-24 rounded hidden sm:block" />
                      <Skeleton className="h-8 w-20 rounded hidden md:block" />
                      <Skeleton className="h-8 w-16 rounded" />
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
              <div className="cyber-panel rounded-2xl overflow-hidden border border-cypher-border shadow-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-cypher-border">
                    <thead className="bg-cypher-surface/90">
                      <tr>
                        <th scope="col" className="px-4 md:px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-cypher-muted w-20">
                          Mã ID
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-cypher-muted">
                          Tên bài tập
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-cypher-muted hidden sm:table-cell">
                          Thể loại
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-cypher-muted hidden md:table-cell">
                          Loại điểm
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-cypher-muted w-28">
                          Thời gian
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-cypher-muted w-28">
                          Bộ nhớ
                        </th>
                        <th scope="col" className="px-4 md:px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-cypher-muted w-24">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cypher-border/60 bg-cypher-surface/30">
                      {filteredAndSorted.map((prob) => (
                        <tr
                          key={prob.id}
                          className="hover:bg-cypher-cyan/10 transition-all duration-150 group"
                        >
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-bold text-cypher-cyan font-mono">
                            #{prob.id}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground">
                            <Link href={`/problems/${prob.id}`} className="hover:text-cypher-cyan transition-colors flex items-center gap-2">
                              <span>{prob.title}</span>
                            </Link>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-cypher-muted font-medium hidden sm:table-cell">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-cypher-purple/10 text-cypher-purple text-xs font-semibold border border-cypher-purple/20">
                              {prob.category || "General"}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                            <span className="inline-block px-2.5 py-0.5 rounded-lg border border-cypher-border bg-cypher-surface text-xs font-semibold text-foreground">
                              {prob.is_subtask ? `${prob.subtasks?.length || 0} Subtasks` : "Chấm 100% Full"}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center text-sm font-bold font-mono text-foreground">
                            {prob.time_limit_ms} ms
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center text-sm font-bold font-mono text-foreground">
                            {prob.memory_limit_mb} MB
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center text-sm">
                            <Link
                              href={`/problems/${prob.id}/edit`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cypher-border bg-cypher-surface hover:border-cypher-cyan hover:text-cypher-cyan text-xs font-bold transition-all"
                              title="Chỉnh sửa đề bài"
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
                    className="glass-card card-hover p-6 rounded-2xl border border-cypher-border flex flex-col justify-between gap-5 relative group hover:border-cypher-cyan/50"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cypher-cyan">
                          #{prob.id}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-cypher-purple/10 text-cypher-purple text-xs font-semibold border border-cypher-purple/20">
                          {prob.category || "General"}
                        </span>
                      </div>

                      <Link href={`/problems/${prob.id}`} className="group-hover:text-cypher-cyan transition-colors">
                        <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2">
                          {prob.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-cypher-border/40 pt-4">
                      <div className="flex items-center justify-between text-xs font-mono text-cypher-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cypher-cyan" /> {prob.time_limit_ms} ms
                        </span>
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-cypher-cyan" /> {prob.memory_limit_mb} MB
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/problems/${prob.id}`}
                          className="flex-1 py-2.5 rounded-xl bg-cypher-cyan/10 border border-cypher-cyan/30 text-cypher-cyan font-bold text-xs uppercase tracking-wider text-center hover:bg-cypher-cyan hover:text-zinc-950 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Code2 className="w-4 h-4" /> Làm bài tập
                        </Link>
                        <Link
                          href={`/problems/${prob.id}/edit`}
                          className="p-2.5 rounded-xl border border-cypher-border bg-cypher-surface hover:border-cypher-cyan hover:text-cypher-cyan transition-all text-cypher-muted"
                          title="Chỉnh sửa"
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
        <footer className="py-8 border-t border-cypher-border text-center text-xs text-cypher-muted mt-auto">
          <p>© 2026 Cypher OJ. &ldquo;Give me a corpse, and I&#39;ll find them.&rdquo;</p>
        </footer>
      </div>
    </PageTransition>
  );
}
