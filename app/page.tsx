"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Shield,
  Cpu,
  Activity,
  ArrowRight,
  Code2,
  CheckCircle2,
  Eye,
  Sparkles,
  Play,
  Camera,
  Radio,
  Lock,
  Trophy,
  HelpCircle,
  ChevronDown,
  RotateCcw,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";
import { PageTransition } from "@/components/PageTransition";
import { getStatsAction } from "@/lib/actions/problems";

// Sample code snippets for live simulator
const SAMPLE_CODES = {
  ab: `#include <iostream>
using namespace std;

// Cypher Tactical A + B Solution
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    long long a, b;
    if (cin >> a >> b) {
        cout << (a + b) << "\\n";
    }
    return 0;
}`,
  twoSum: `#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

// Neural Theft Hash Map Lookup
int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    unordered_map<int, int> pos;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        int complement = target - x;
        if (pos.count(complement)) {
            cout << pos[complement] << " " << i << "\\n";
            return 0;
        }
        pos[x] = i;
    }
    return 0;
}`,
};

const SIMULATED_TESTS = {
  ab: [
    { id: 1, name: "Test #1 (Base Case)", input: "5 7", expected: "12", time: "0.8ms", mem: "1.1MB" },
    { id: 2, name: "Test #2 (Large Int64)", input: "1000000000 2000000000", expected: "3000000000", time: "1.2ms", mem: "1.2MB" },
    { id: 3, name: "Test #3 (Negative Values)", input: "-15 30", expected: "15", time: "0.9ms", mem: "1.1MB" },
  ],
  twoSum: [
    { id: 1, name: "Test #1 (Basic Pair)", input: "4 9 \\n 2 7 11 15", expected: "0 1", time: "1.4ms", mem: "1.8MB" },
    { id: 2, name: "Test #2 (Unsorted Array)", input: "5 10 \\n 3 2 4 8 1", expected: "1 3", time: "1.6ms", mem: "1.9MB" },
    { id: 3, name: "Test #3 (Large Scale)", input: "1000 500 \\n ...", expected: "12 88", time: "2.1ms", mem: "2.4MB" },
  ],
};

const AGENT_LEADERBOARD = [
  { rank: 1, name: "Cypher_Radiant", solved: 142, points: 14200, badge: "Radiant Master", color: "text-amber-400 font-bold" },
  { rank: 2, name: "Chamber_Sniper", solved: 128, points: 12800, badge: "Immortal III", color: "text-purple-400 font-bold" },
  { rank: 3, name: "Sova_Recon", solved: 115, points: 11500, badge: "Immortal I", color: "text-cypher-cyan font-bold" },
  { rank: 4, name: "Omen_Shadow", solved: 98, points: 9800, badge: "Diamond III", color: "text-blue-400 font-bold" },
  { rank: 5, name: "Killjoy_Tech", solved: 86, points: 8600, badge: "Diamond I", color: "text-emerald-400 font-bold" },
];

const FAQS = [
  {
    q: "Cypher OJ là gì và hỗ trợ những ngôn ngữ lập trình nào?",
    a: "Cypher OJ là hệ thống chấm bài trực tuyến chuẩn Tactical được thiết kế chuyên sâu cho C++ (GCC 17 với flag tối ưu -O3). Hệ thống cô lập môi trường sandbox an toàn và đo lường chính xác thời gian thực thi ms và dung lượng bộ nhớ MB.",
  },
  {
    q: "Tính năng Realtime NDJSON Streaming Judge hoạt động như thế nào?",
    a: "Ngay khi bạn bấm nộp bài (hoặc phím tắt Ctrl + Enter), hệ thống truyền trực tiếp tiến trình chấm bài của từng testcase về trình duyệt theo thời gian thực mà không cần chờ cả lượt nộp hoàn tất.",
  },
  {
    q: "Làm thế nào để tạo bài tập có chia Subtasks?",
    a: "Truy cập trang Tạo bài tập mới, bật công tắc 'Chia Subtasks', sau đó thêm các Subtask với tên điều kiện và mức điểm riêng. Hệ thống tự động tính tổng điểm và xác thực thang điểm 100đ.",
  },
  {
    q: "Có hỗ trợ công thức Toán học LaTeX và Markdown không?",
    a: "Có! Tất cả các bài tập trên Cypher OJ hỗ trợ định dạng Markdown và công thức LaTeX toán học chuẩn KaTeX (cả Inline $...$ và Block $$...$$). Trình soạn thảo cung cấp thanh công cụ chèn nhanh tiện lợi.",
  },
];

export default function Home() {
  const [stats, setStats] = useState<{ problems: number; submissions: number }>(() => ({
    problems: 0,
    submissions: 0,
  }));

  // Simulator state
  const [simPreset, setSimPreset] = useState<"ab" | "twoSum">("ab");
  const [simCode, setSimCode] = useState(SAMPLE_CODES.ab);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    getStatsAction()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error("Failed to fetch stats", err);
      });
  }, []);

  const handlePresetChange = (preset: "ab" | "twoSum") => {
    setSimPreset(preset);
    setSimCode(SAMPLE_CODES[preset]);
    setSimStep(0);
    setIsSimulating(false);
  };

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(0);

    setTimeout(() => setSimStep(1), 400);
    setTimeout(() => setSimStep(2), 900);
    setTimeout(() => setSimStep(3), 1400);
    setTimeout(() => {
      setSimStep(4);
      setIsSimulating(false);
    }, 1900);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background cyber-grid scanline text-foreground flex flex-col selection:bg-cypher-cyan/30">
        {/* Top Ticker Status Banner - Solid Opaque Background */}
        <div className="bg-cypher-surface border-b border-cypher-border py-2 px-4 text-[11px] font-mono text-cypher-muted overflow-x-auto whitespace-nowrap flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6 max-w-7xl mx-auto w-full">
            <span className="flex items-center gap-1.5 text-cypher-cyan font-bold">
              <span className="w-2 h-2 rounded-full bg-cypher-cyan animate-pulse" /> ENGINE: G++ 17 (-O3) ONLINE
            </span>
            <span className="hidden sm:inline text-cypher-border">•</span>
            <span className="hidden sm:inline font-semibold">SPYCAM LATENCY: &lt; 1.2ms</span>
            <span className="hidden md:inline text-cypher-border">•</span>
            <span className="hidden md:inline font-semibold">TRAPWIRE DETECTORS: 100% ACTIVE</span>
            <span className="hidden lg:inline text-cypher-border">•</span>
            <span className="hidden lg:inline text-green-500 font-bold">JUDGE QUEUE: IDLE (READY FOR SUBMISSION)</span>
          </div>
        </div>

        {/* Sticky Header - Solid Opaque Background */}
        <header className="border-b border-cypher-border bg-cypher-surface sticky top-0 z-50 transition-all shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-cypher-cyan/10 border border-cypher-cyan/40 flex items-center justify-center shadow-[0_0_12px_rgba(14,165,233,0.25)] group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5 text-cypher-cyan animate-pulse" />
              </div>
              <span className="text-xl font-black tracking-widest text-shimmer">
                CYPHER<span className="text-cypher-cyan">.OJ</span>
              </span>
            </Link>

            <nav className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/problems"
                className="text-sm font-semibold hover:text-cypher-cyan transition-colors hidden sm:flex items-center gap-1.5"
              >
                <Code2 className="w-4 h-4" />
                Kho bài tập
              </Link>
              <Link
                href="/problems/create"
                className="text-sm font-semibold text-cypher-cyan/90 hover:text-cypher-cyan transition-colors hidden sm:flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Tạo bài tập
              </Link>
              <ThemeToggle />
              <MobileMenu />
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 md:py-20 flex flex-col items-center text-center gap-20">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 max-w-4xl"
          >
            {/* Agent Cypher Status Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <span className="cyber-badge-cyan">
                <Shield className="w-3.5 h-3.5" /> SECURE HACKER TERMINAL CONNECTED
              </span>
              <span className="cyber-badge-purple">
                <Radio className="w-3.5 h-3.5" /> TRAPWIRE NETWORKS ONLINE
              </span>
            </div>

            {/* Iconic Agent Cypher Quote */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[1.1] text-foreground">
              I KNOW <span className="text-cypher-cyan drop-shadow-[0_0_35px_rgba(14,165,233,0.45)]">EXACTLY</span> WHERE THEY ARE.
            </h1>

            <p className="max-w-2xl text-base md:text-lg text-cypher-muted leading-relaxed font-medium">
              Cypher Online Judge — tactical C++ coding chamber. Run your scripts, isolate memory leaks, and deploy solutions to the matrix.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
              <Link
                href="/problems"
                className="group btn-glow relative w-full sm:w-auto px-8 py-4 bg-cypher-cyan text-zinc-950 font-black tracking-wider uppercase rounded-xl transition-all duration-300 hover:bg-cypher-cyan/90 hover:scale-105 hover:shadow-[0_0_35px_rgba(14,165,233,0.4)] border-2 border-transparent border-cypher-cyan/30 flex items-center justify-center gap-3 text-base"
              >
                Truy cập Kho bài tập <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>

              <Link
                href="/problems/create"
                className="w-full sm:w-auto px-8 py-4 glass-panel text-foreground font-bold tracking-wider uppercase rounded-xl hover:border-cypher-cyan/50 transition-all hover:scale-105 flex items-center justify-center gap-2 text-base shadow-md"
              >
                <Sparkles className="w-5 h-5 text-cypher-cyan" /> Tạo bài tập mới
              </Link>
            </div>
          </motion.div>

          {/* Interactive Live Code Sandbox / Simulator - High Contrast Opaque Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-5xl cyber-panel rounded-2xl border border-cypher-border overflow-hidden shadow-2xl text-left bg-cypher-surface"
          >
            {/* Terminal Top Control Bar */}
            <div className="bg-cypher-surface border-b border-cypher-border px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs font-mono text-cypher-muted ml-2 flex items-center gap-1.5 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-cypher-cyan" /> agent_cypher-interactive-sandbox
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-cypher-muted font-bold mr-1 hidden sm:inline">Bài mẫu:</span>
                <button
                  onClick={() => handlePresetChange("ab")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    simPreset === "ab"
                      ? "bg-cypher-cyan text-zinc-950 shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                      : "bg-background text-cypher-muted hover:text-foreground border border-cypher-border"
                  }`}
                >
                  A + B Problem
                </button>

                <button
                  onClick={() => handlePresetChange("twoSum")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    simPreset === "twoSum"
                      ? "bg-cypher-cyan text-zinc-950 shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                      : "bg-background text-cypher-muted hover:text-foreground border border-cypher-border"
                  }`}
                >
                  Two Sum (Hash Map)
                </button>

                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="px-3.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSimulating ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {isSimulating ? "Chấm..." : "Chạy thử (Run)"}
                </button>
              </div>
            </div>

            {/* Split Simulator Body */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-cypher-border bg-zinc-950 text-zinc-200">
              {/* Code Editor Pane */}
              <div className="p-4 font-mono text-xs md:text-sm overflow-x-auto min-h-[260px] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cypher-muted mb-2 flex items-center justify-between border-b border-zinc-800 pb-1">
                    <span>Source Code (C++17 GCC)</span>
                    <button
                      onClick={() => setSimCode(SAMPLE_CODES[simPreset])}
                      className="text-cypher-cyan hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                  <textarea
                    value={simCode}
                    onChange={(e) => setSimCode(e.target.value)}
                    rows={12}
                    className="w-full bg-transparent text-emerald-400 font-mono text-xs outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Realtime Stream Output Pane */}
              <div className="p-4 font-mono text-xs md:text-sm flex flex-col justify-between bg-zinc-950 min-h-[260px]">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cypher-cyan mb-3 border-b border-zinc-800 pb-1 flex items-center justify-between">
                    <span>Realtime Stream Output</span>
                    <span className="text-[10px] text-zinc-500 font-normal">NDJSON Streaming Protocol</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {simStep >= 1 && (
                      <div className="text-cypher-cyan font-semibold flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 fill-current animate-pulse" />
                        <span>{"[1/4] Compiling source code (g++ -O3 -std=c++17)... OK (0.04s)"}</span>
                      </div>
                    )}

                    {simStep >= 2 && (
                      <div className="text-emerald-400 flex items-center justify-between bg-zinc-900 p-2.5 rounded border border-emerald-500/30">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{SIMULATED_TESTS[simPreset][0].name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-300 font-bold font-mono">
                          {SIMULATED_TESTS[simPreset][0].time} | {SIMULATED_TESTS[simPreset][0].mem}
                        </span>
                      </div>
                    )}

                    {simStep >= 3 && (
                      <div className="text-emerald-400 flex items-center justify-between bg-zinc-900 p-2.5 rounded border border-emerald-500/30">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{SIMULATED_TESTS[simPreset][1].name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-300 font-bold font-mono">
                          {SIMULATED_TESTS[simPreset][1].time} | {SIMULATED_TESTS[simPreset][1].mem}
                        </span>
                      </div>
                    )}

                    {simStep >= 4 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2 p-3.5 rounded-xl bg-zinc-900 border border-cypher-cyan text-cypher-cyan flex flex-col gap-1 shadow-[0_0_15px_rgba(14,165,233,0.25)]"
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>==&gt; FINAL VERDICT: ACCEPTED</span>
                          <span className="text-xs bg-cypher-cyan text-zinc-950 px-2 py-0.5 rounded font-black">100/100đ</span>
                        </div>
                        <div className="text-[11px] text-cypher-muted italic mt-0.5">
                          &quot;Gig&#39;s up! All testcases passed. Location confirmed.&quot;
                        </div>
                      </motion.div>
                    )}

                    {simStep === 0 && (
                      <div className="text-zinc-500 italic text-xs py-8 text-center">
                        Bấm nút &quot;Chạy thử (Run)&quot; ở góc trên để trải nghiệm giả lập chấm trực tiếp trên trang chủ.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card card-hover p-6 rounded-2xl flex items-center gap-5 border border-cypher-border hover:border-cypher-cyan/50 group bg-cypher-surface shadow-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-cypher-cyan/10 border border-cypher-cyan/30 flex items-center justify-center text-cypher-cyan group-hover:scale-110 transition-transform">
                <Cpu className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="text-3xl font-black text-foreground font-mono">{stats.problems}</div>
                <div className="text-xs uppercase tracking-wider text-cypher-muted font-bold">Bài tập nạp sẵn</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card card-hover p-6 rounded-2xl flex items-center gap-5 border border-cypher-border hover:border-cypher-warning/50 group bg-cypher-surface shadow-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-cypher-warning/10 border border-cypher-warning/30 flex items-center justify-center text-cypher-warning group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="text-3xl font-black text-foreground font-mono">{stats.submissions}</div>
                <div className="text-xs uppercase tracking-wider text-cypher-muted font-bold">Submission gần đây</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass-card card-hover p-6 rounded-2xl flex items-center gap-5 border border-cypher-border hover:border-cypher-success/50 group bg-cypher-surface shadow-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-cypher-success/10 border border-cypher-success/30 flex items-center justify-center text-cypher-success group-hover:scale-110 transition-transform">
                <Eye className="w-7 h-7 subtle-pulse" />
              </div>
              <div className="text-left">
                <div className="text-3xl font-black text-cypher-success font-mono">ACTIVE</div>
                <div className="text-xs uppercase tracking-wider text-cypher-muted font-bold">Spycam Status</div>
              </div>
            </motion.div>
          </div>

          {/* Valorant Cypher 4 Tactical Abilities Section */}
          <div className="w-full max-w-5xl text-left">
            <h2 className="text-xs font-black uppercase tracking-widest text-cypher-cyan border-b border-cypher-border pb-3 mb-8 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cypher-cyan" /> Cypher Agent Tactical Abilities & System Specs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ability C */}
              <div className="glass-card p-6 rounded-2xl border border-cypher-border flex flex-col gap-3 hover:border-cypher-cyan/40 transition-all bg-cypher-surface shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-cypher-cyan/20 text-cypher-cyan font-mono font-bold text-xs border border-cypher-cyan/30">
                    [C] TRAPWIRE SCORING
                  </span>
                  <Radio className="w-4 h-4 text-cypher-cyan" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Subtask Trapwire Engine</h3>
                <p className="text-sm text-cypher-muted leading-relaxed font-medium">
                  Thiết lập bẫy điểm Subtask chi tiết theo chuẩn HSG/VNOI. Đánh giá chính xác từng nhóm điều kiện biên và trường hợp đặc biệt.
                </p>
              </div>

              {/* Ability Q */}
              <div className="glass-card p-6 rounded-2xl border border-cypher-border flex flex-col gap-3 hover:border-cypher-purple/40 transition-all bg-cypher-surface shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-cypher-purple/20 text-cypher-purple font-mono font-bold text-xs border border-cypher-purple/30">
                    [Q] CYBER CAGE SANDBOX
                  </span>
                  <Lock className="w-4 h-4 text-cypher-purple" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Isolate Memory Sandbox</h3>
                <p className="text-sm text-cypher-muted leading-relaxed font-medium">
                  Cô lập tuyệt đối môi trường biên dịch mã nguồn C++, kiểm soát bộ nhớ RAM và giới hạn thời gian thực thi ms chuẩn xác.
                </p>
              </div>

              {/* Ability E */}
              <div className="glass-card p-6 rounded-2xl border border-cypher-border flex flex-col gap-3 hover:border-cypher-success/40 transition-all bg-cypher-surface shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-cypher-success/20 text-cypher-success font-mono font-bold text-xs border border-cypher-success/30">
                    [E] SPYCAM STREAMING
                  </span>
                  <Eye className="w-4 h-4 text-cypher-success" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Realtime Testcase Surveillance</h3>
                <p className="text-sm text-cypher-muted leading-relaxed font-medium">
                  Spycam truyền dữ liệu NDJSON trực tiếp từng testcase về giao diện theo thời gian thực mà không cần chờ nộp xong.
                </p>
              </div>

              {/* Ability X */}
              <div className="glass-card p-6 rounded-2xl border border-cypher-border flex flex-col gap-3 hover:border-cypher-warning/40 transition-all bg-cypher-surface shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-cypher-warning/20 text-cypher-warning font-mono font-bold text-xs border border-cypher-warning/30">
                    [X] NEURAL THEFT PROFILER
                  </span>
                  <Cpu className="w-4 h-4 text-cypher-warning" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Full LaTeX & Error Inspector</h3>
                <p className="text-sm text-cypher-muted leading-relaxed font-medium">
                  Phân tích nhật ký lỗi biên dịch (CE/RE/TLE) chi tiết, định dạng đề bài Markdown và KaTeX LaTeX sắc nét.
                </p>
              </div>
            </div>
          </div>

          {/* Top Tactical Agents Leaderboard Preview */}
          <div className="w-full max-w-5xl text-left">
            <div className="flex items-center justify-between border-b border-cypher-border pb-3 mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-cypher-cyan flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Top Tactical Agents Leaderboard
              </h2>
              <span className="text-xs text-cypher-muted font-mono font-bold">Season 2026</span>
            </div>

            <div className="cyber-panel rounded-2xl overflow-hidden border border-cypher-border shadow-lg bg-cypher-surface">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-cypher-border">
                  <thead className="bg-cypher-surface">
                    <tr>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-black uppercase tracking-wider text-cypher-muted w-16">
                        Hạng
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-black uppercase tracking-wider text-cypher-muted">
                        Agent Identifier
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-center text-xs font-black uppercase tracking-wider text-cypher-muted">
                        Danh hiệu (Badge)
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-center text-xs font-black uppercase tracking-wider text-cypher-muted">
                        Bài đã giải
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-right text-xs font-black uppercase tracking-wider text-cypher-muted">
                        Tổng điểm
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cypher-border/60 bg-cypher-surface text-xs font-mono">
                    {AGENT_LEADERBOARD.map((agent) => (
                      <tr key={agent.rank} className="hover:bg-cypher-cyan/10 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-cypher-cyan">#{agent.rank}</td>
                        <td className="px-4 py-3.5 font-bold text-foreground">{agent.name}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] ${agent.color} bg-background border-current/30`}>
                            {agent.badge}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-foreground">{agent.solved}</td>
                        <td className="px-4 py-3.5 text-right font-black text-cypher-cyan">{agent.points}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Interactive FAQ Accordion - Solid High-Contrast Cards */}
          <div className="w-full max-w-5xl text-left">
            <h2 className="text-xs font-black uppercase tracking-widest text-cypher-cyan border-b border-cypher-border pb-3 mb-6 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cypher-cyan" /> Câu hỏi thường gặp (FAQ)
            </h2>

            <div className="flex flex-col gap-3">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="cyber-panel rounded-2xl border border-cypher-border overflow-hidden bg-cypher-surface shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-5 text-left font-bold text-sm md:text-base flex items-center justify-between gap-4 text-foreground hover:text-cypher-cyan transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openFaq === idx ? "rotate-180 text-cypher-cyan" : "text-cypher-muted"}`} />
                  </button>

                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs md:text-sm text-cypher-muted leading-relaxed border-t border-cypher-border/60 pt-3 font-medium bg-cypher-surface">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer - Agent Cypher Iconic Voiceline */}
        <footer className="py-8 border-t border-cypher-border text-center text-xs text-cypher-muted mt-auto bg-cypher-surface">
          <p>© 2026 Cypher OJ. &ldquo;Give me a corpse, and I&#39;ll find them.&rdquo;</p>
        </footer>
      </div>
    </PageTransition>
  );
}
