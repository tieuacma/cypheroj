"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Terminal, Edit, Search, Shield, Loader2, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";
import { PageTransition } from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DbProblem } from "@/lib/db/types";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<DbProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  // Filter problems
  const filtered = problems.filter((prob) => {
    const matchesSearch =
      prob.title.toLowerCase().includes(search.toLowerCase()) ||
      prob.id.toLowerCase().includes(search.toLowerCase()) ||
      (prob.category?.toLowerCase() || "").includes(search.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "all" || prob.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter
  const categories = ["all", ...Array.from(new Set(problems.map((p) => p.category).filter(Boolean)))];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background cyber-grid text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-cypher-border bg-cypher-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-cypher-cyan/10 border border-cypher-cyan flex items-center justify-center shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              <Terminal className="w-4.5 h-4.5 text-cypher-cyan" />
            </div>
            <span className="text-xl font-black tracking-widest text-shimmer hidden sm:inline">
              CYPHER<span className="text-cypher-cyan">.OJ</span>
            </span>
            <span className="text-lg font-black tracking-widest text-shimmer sm:hidden">
              CYPHER<span className="text-cypher-cyan">.OJ</span>
            </span>
          </Link>
          
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/problems" className="text-sm font-semibold text-cypher-cyan border-b border-cypher-cyan pb-0.5 hidden sm:block">
              Kho bài tập
            </Link>
            <ThemeToggle />
            <MobileMenu />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-10">
        <div className="flex flex-col gap-8">
          {/* Page Title & Intro */}
          <div className="flex justify-between items-start md:items-end flex-col md:flex-row gap-6 border-b border-cypher-border/40 pb-6">
            <div className="w-full md:w-auto">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase flex items-center gap-3">
                <Shield className="w-6 h-6 md:w-7 md:h-7 text-cypher-cyan animate-pulse" />
                Problem Database
              </h1>
              <p className="text-sm md:text-base text-cypher-muted mt-2 font-medium">
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
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {/* Search Input */}
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cypher-muted">
                <Search className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm bài tập bằng ID, Tên bài, Thể loại..."
                className="block w-full pl-11 pr-4 py-3 border border-cypher-border rounded-xl bg-cypher-surface placeholder-cypher-muted text-foreground focus:outline-none focus:border-cypher-cyan focus:ring-2 focus:ring-cypher-cyan/20 text-sm transition-all shadow-sm hover:border-cypher-cyan/50"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="sm:w-72 w-full">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-4 py-3 border border-cypher-border rounded-xl bg-cypher-surface text-foreground focus:outline-none focus:border-cypher-cyan focus:ring-2 focus:ring-cypher-cyan/20 text-sm transition-all shadow-sm hover:border-cypher-cyan/50 cursor-pointer"
              >
                <option value="all">Tất cả Thể loại</option>
                {categories.filter(c => c !== "all").map((cat) => (
                  <option key={cat} value={cat}>
                    Thể loại: {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Panel */}
          <div className="cyber-panel rounded-2xl overflow-hidden border border-cypher-border shadow-lg">
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-cypher-border/50 last:border-0">
                      <Skeleton className="h-8 w-16 rounded" />
                      <Skeleton className="h-8 flex-1 rounded" />
                      <Skeleton className="h-8 w-24 rounded hidden sm:block" />
                      <Skeleton className="h-8 w-20 rounded hidden md:block" />
                      <Skeleton className="h-8 w-16 rounded" />
                      <Skeleton className="h-8 w-16 rounded" />
                      <Skeleton className="h-8 w-16 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <EmptyState
                type="error"
                title="Lỗi tải dữ liệu"
                description={error}
                actionLabel="Thử lại"
                onAction={() => window.location.reload()}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-cypher-border">
                  <thead className="bg-cypher-surface/80">
                    <tr>
                      <th scope="col" className="px-4 md:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-cypher-muted w-16 md:w-20">
                        Mã
                      </th>
                      <th scope="col" className="px-4 md:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-cypher-muted">
                        Tên bài tập
                      </th>
                      <th scope="col" className="px-4 md:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-cypher-muted hidden sm:table-cell">
                        Thể loại
                      </th>
                      <th scope="col" className="px-4 md:px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-cypher-muted hidden md:table-cell">
                        Cấu hình
                      </th>
                      <th scope="col" className="px-4 md:px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-cypher-muted w-24 md:w-32">
                        T/L
                      </th>
                      <th scope="col" className="px-4 md:px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-cypher-muted w-24 md:w-32">
                        M/L
                      </th>
                      <th scope="col" className="px-4 md:px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-cypher-muted w-20 md:w-28">
                        Tùy chọn
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cypher-border bg-cypher-surface/30">
                    {filtered.length > 0 ? (
                      filtered.map((prob) => (
                        <tr 
                          key={prob.id} 
                          className="hover:bg-cypher-cyan/10 transition-all duration-200 group hover:shadow-md"
                        >
                          <td className="px-4 md:px-6 py-4 md:py-5 whitespace-nowrap text-sm font-bold text-cypher-cyan font-mono">
                            #{prob.id}
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5 whitespace-nowrap text-sm font-bold text-foreground">
                            <Link href={`/problems/${prob.id}`} className="hover:text-cypher-cyan transition-colors group-hover:underline decoration-cypher-cyan/50 underline-offset-4">
                              {prob.title}
                            </Link>
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5 whitespace-nowrap text-sm text-cypher-muted font-medium hidden sm:table-cell">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cypher-purple/10 text-cypher-purple text-xs font-semibold border border-cypher-purple/20">
                              {prob.category || "General"}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5 whitespace-nowrap text-sm hidden md:table-cell">
                            <span className="inline-block px-3 py-1 rounded-lg border border-cypher-border bg-cypher-surface text-xs font-semibold text-foreground">
                              {prob.is_subtask ? `${prob.subtasks?.length || 0} Subtasks` : "Full Test"}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5 whitespace-nowrap text-center text-sm font-bold font-mono text-foreground">
                            {prob.time_limit_ms}
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5 whitespace-nowrap text-center text-sm font-bold font-mono text-foreground">
                            {prob.memory_limit_mb}
                          </td>
                          <td className="px-4 md:px-6 py-4 md:py-5 whitespace-nowrap text-center text-sm">
                            <Link
                              href={`/problems/${prob.id}/edit`}
                              className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-cypher-border bg-cypher-surface hover:border-cypher-cyan hover:text-cypher-cyan hover:bg-cypher-cyan/5 text-xs font-bold transition-all shadow-sm hover:shadow-md"
                              title="Chỉnh sửa đề bài"
                            >
                              <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              <span className="hidden sm:inline">Sửa</span>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <EmptyState
                            type="search"
                            title="Không tìm thấy bài tập nào"
                            description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc thể loại"
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
