"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Camera,
  Radio,
  Lock,
  Cpu,
  Code2,
  Sparkles,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Play,
  HelpCircle,
  ChevronDown,
  RotateCcw,
  Zap,
  BookOpen,
  Shield,
  Activity,
  Terminal,
  Layers,
  Flame,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { getStatsAction } from "@/lib/actions/problems";
import { useLanguage } from "@/lib/language-context";
import { CypherVoicelineWidget } from "@/components/CypherVoicelineWidget";
import { getRandomVoiceline } from "@/lib/cypher-voicelines";

// Sample code snippets for interactive student sandbox
const SAMPLE_CODES = {
  ab: `#include <iostream>
using namespace std;

// Cypher Tactical A + B Solution for Students
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

const AGENT_STUDENT_LEADERBOARD = [
  { rank: 1, name: "Cypher_Radiant", school: "THPT Chuyên KHTN", solved: 142, points: 14200, badge: "Radiant Master", color: "text-amber-500 font-extrabold" },
  { rank: 2, name: "Chamber_Sniper", school: "THPT Chuyên Lê Hồng Phong", solved: 128, points: 12800, badge: "Immortal III", color: "text-purple-500 font-extrabold" },
  { rank: 3, name: "Sova_Recon", school: "THCS Cầu Giấy", solved: 115, points: 11500, badge: "Immortal I", color: "text-sky-500 font-extrabold" },
  { rank: 4, name: "Omen_Shadow", school: "THPT Chuyên Amst", solved: 98, points: 9800, badge: "Diamond III", color: "text-blue-500 font-extrabold" },
  { rank: 5, name: "Killjoy_Tech", school: "THPT Chuyên Trần Phú", solved: 86, points: 8600, badge: "Diamond I", color: "text-emerald-500 font-extrabold" },
];

const FAQS = [
  {
    q: "Cypher OJ là gì và hỗ trợ những ngôn ngữ lập trình nào?",
    a: "Cypher OJ là hệ thống luyện tập trực tuyến chuẩn Agent Tactical được thiết kế chuyên sâu cho C++ (GCC 17 với flag tối ưu -O3). Hệ thống cô lập môi trường Cyber Cage an toàn và đo lường chính xác thời gian thực thi ms và dung lượng bộ nhớ MB.",
  },
  {
    q: "Tính năng Realtime Spycam NDJSON Streaming Judge hoạt động như thế nào?",
    a: "Ngay khi bạn bấm nộp bài (hoặc Ctrl + Enter), Spycam truyền trực tiếp tiến trình chấm bài của từng testcase về màn hình theo thời gian thực mà không cần chờ cả lượt nộp hoàn tất.",
  },
  {
    q: "Làm thế nào để tạo bài tập có chia Subtasks Trapwire?",
    a: "Truy cập trang Tạo bài tập mới, bật công tắc 'Chia Subtasks', sau đó thêm các Subtask bẫy điểm với tên điều kiện và mức điểm riêng. Hệ thống tự động tính tổng điểm và xác thực thang điểm 100đ.",
  },
  {
    q: "Có hỗ trợ công thức Toán học LaTeX và Markdown không?",
    a: "Có! Tất cả các bài tập trên Cypher OJ hỗ trợ định dạng Markdown và công thức LaTeX toán học chuẩn KaTeX (cả Inline $...$ và Block $$...$$). Trình soạn thảo cung cấp thanh công cụ chèn nhanh tiện lợi.",
  },
];

export default function Home() {
  const { lang, t } = useLanguage();

  const [stats, setStats] = useState<{ problems: number; submissions: number }>({
    problems: 0,
    submissions: 0,
  });

  // Simulator state
  const [simPreset, setSimPreset] = useState<"ab" | "twoSum">("ab");
  const [simCode, setSimCode] = useState(SAMPLE_CODES.ab);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [sandboxVoiceline, setSandboxVoiceline] = useState<{ en: string; vi: string } | null>(null);

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
    setSandboxVoiceline(getRandomVoiceline("compiling"));

    setTimeout(() => {
      setSimStep(1);
    }, 400);

    setTimeout(() => {
      setSimStep(2);
      setSandboxVoiceline(getRandomVoiceline("testcasePass"));
    }, 900);

    setTimeout(() => {
      setSimStep(3);
    }, 1400);

    setTimeout(() => {
      setSimStep(4);
      setSandboxVoiceline(getRandomVoiceline("accepted"));
      setIsSimulating(false);
    }, 1900);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-sky-500/20">
        {/* Top Ticker Status Banner - Agent Cypher Spycam HUD */}
        <div className="bg-sky-500/10 border-b border-sky-500/20 py-2 px-4 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-nowrap flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6 max-w-7xl mx-auto w-full">
            <span className="flex items-center gap-1.5 text-sky-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" /> ENGINE: G++ 17 (-O3) ONLINE
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="hidden sm:inline font-semibold">SPYCAM LATENCY: &lt; 1.2ms</span>
            <span className="hidden md:inline text-border">•</span>
            <span className="hidden md:inline font-semibold">TRAPWIRE DETECTORS: 100% ACTIVE</span>
            <span className="hidden lg:inline text-border">•</span>
            <span className="hidden lg:inline text-emerald-500 font-bold">JUDGE QUEUE: IDLE (READY FOR STUDENT SUBMISSION)</span>
          </div>
        </div>

        <Navbar />

        {/* Hero Section */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 md:py-16 flex flex-col items-center text-center gap-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6 max-w-4xl"
          >
            {/* Cypher Live Voiceline Banner */}
            <div className="w-full max-w-xl">
              <CypherVoicelineWidget type="hero" />
            </div>

            {/* Valorant Agent Cypher Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                <Shield className="w-4 h-4 text-sky-500" /> {t.hero.badge1}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                <Radio className="w-4 h-4 text-purple-500" /> {t.hero.badge2}
              </span>
            </div>

            {/* Iconic Agent Cypher Voiceline Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-[1.1]">
              I KNOW <span className="bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">EXACTLY</span> WHERE THEY ARE.
            </h1>

            <p className="max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
              {t.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
              <Link
                href="/problems"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl hover:opacity-95 shadow-xl shadow-sky-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2.5"
              >
                {t.hero.btnExplore} <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/problems/create"
                className="w-full sm:w-auto px-8 py-4 bg-background border border-sky-500/30 text-foreground font-extrabold text-sm uppercase tracking-wider rounded-2xl hover:border-sky-500 hover:bg-sky-500/5 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-5 h-5 text-amber-500" /> {t.hero.btnCreate}
              </Link>
            </div>
          </motion.div>

          {/* Interactive Live Code Sandbox / Simulator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-5xl rounded-3xl border border-sky-500/20 bg-card overflow-hidden shadow-2xl text-left"
          >
            {/* Terminal Control Bar */}
            <div className="bg-muted/40 border-b border-border px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-bold text-muted-foreground ml-2 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-sky-500" /> agent_cypher-interactive-sandbox
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground mr-1 hidden sm:inline">Bài mẫu:</span>
                <button
                  onClick={() => handlePresetChange("ab")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    simPreset === "ab"
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-background text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {t.sandbox.sampleAb}
                </button>

                <button
                  onClick={() => handlePresetChange("twoSum")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    simPreset === "twoSum"
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-background text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {t.sandbox.sampleTwoSum}
                </button>

                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="px-4 py-1 rounded-xl text-xs font-extrabold bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {isSimulating ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {isSimulating ? t.sandbox.running : t.sandbox.run}
                </button>
              </div>
            </div>

            {/* Live Cypher Submission Voiceline Banner */}
            {sandboxVoiceline && (
              <div className="p-3 bg-sky-500/10 border-b border-sky-500/20 px-4">
                <CypherVoicelineWidget customText={sandboxVoiceline} />
              </div>
            )}

            {/* Split Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border bg-zinc-100 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {/* Source Code Pane */}
              <div className="p-4 font-mono text-xs md:text-sm overflow-x-auto min-h-[260px] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 flex items-center justify-between border-b border-zinc-300 dark:border-zinc-800 pb-1">
                    <span>Source Code (C++17 GCC)</span>
                    <button
                      onClick={() => setSimCode(SAMPLE_CODES[simPreset])}
                      className="text-sky-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <RotateCcw className="w-3 h-3" /> {t.sandbox.reset}
                    </button>
                  </div>
                  <textarea
                    value={simCode}
                    onChange={(e) => setSimCode(e.target.value)}
                    rows={12}
                    className="w-full bg-transparent text-emerald-600 dark:text-emerald-400 font-mono text-xs outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Spycam Stream Output Pane */}
              <div className="p-4 font-mono text-xs md:text-sm flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 min-h-[260px]">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 mb-3 border-b border-zinc-800 pb-1 flex items-center justify-between">
                    <span>Spycam Realtime Stream Output</span>
                    <span className="text-[10px] text-zinc-500 font-normal">NDJSON Streaming Protocol</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {simStep >= 1 && (
                      <div className="text-sky-400 font-semibold flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 fill-current animate-pulse" />
                        <span>{"[1/4] Compiling source code (g++ -O3 -std=c++17)... OK (0.04s)"}</span>
                      </div>
                    )}

                    {simStep >= 2 && (
                      <div className="text-emerald-600 dark:text-emerald-400 flex items-center justify-between bg-emerald-500/10 dark:bg-zinc-900 p-2.5 rounded-xl border border-emerald-500/30">
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
                      <div className="text-emerald-600 dark:text-emerald-400 flex items-center justify-between bg-emerald-500/10 dark:bg-zinc-900 p-2.5 rounded-xl border border-emerald-500/30">
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
                        className="mt-2 p-4 rounded-2xl bg-sky-500/10 dark:bg-zinc-900 border border-sky-400 text-sky-600 dark:text-sky-400 flex flex-col gap-1 shadow-lg"
                      >
                        <div className="font-extrabold flex items-center justify-between">
                          <span>==&gt; FINAL VERDICT: ACCEPTED</span>
                          <span className="text-xs bg-sky-400 text-zinc-950 dark:text-zinc-950 px-2 py-0.5 rounded-lg font-black">100/100đ</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground italic mt-0.5">
                          &quot;Gig&#39;s up! All testcases passed. Location confirmed.&quot;
                        </div>
                      </motion.div>
                    )}

                    {simStep === 0 && (
                      <div className="text-muted-foreground italic text-xs py-8 text-center">
                        Bấm nút &quot;Chạy thử (Run)&quot; ở góc trên để trải nghiệm giả lập chấm trực tiếp.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            <div className="p-6 rounded-3xl border border-sky-500/20 bg-card hover:border-sky-500/40 transition-all flex items-center gap-5 shadow-sm text-left">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500">
                <Cpu className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl font-black font-mono">{stats.problems}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.metrics.problems}</div>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-indigo-500/20 bg-card hover:border-indigo-500/40 transition-all flex items-center gap-5 shadow-sm text-left">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl font-black font-mono">{stats.submissions}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.metrics.submissions}</div>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-emerald-500/20 bg-card hover:border-emerald-500/40 transition-all flex items-center gap-5 shadow-sm text-left">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Eye className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="text-3xl font-black font-mono text-emerald-500">ACTIVE</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Spycam Status</div>
              </div>
            </div>
          </div>

          {/* Valorant Cypher 4 Tactical Abilities Section */}
          <div className="w-full max-w-5xl text-left">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-sky-500 border-b border-border pb-3 mb-8 flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-500" /> {t.abilities.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ability C */}
              <div className="p-6 rounded-3xl border border-sky-500/20 bg-card flex flex-col gap-3 hover:border-sky-500/40 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-bold text-xs border border-sky-500/20">
                    [C] TRAPWIRE SCORING
                  </span>
                  <Radio className="w-4 h-4 text-sky-500" />
                </div>
                <h3 className="text-lg font-bold">{t.abilities.c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {t.abilities.c.desc}
                </p>
              </div>

              {/* Ability Q */}
              <div className="p-6 rounded-3xl border border-purple-500/20 bg-card flex flex-col gap-3 hover:border-purple-500/40 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold text-xs border border-purple-500/20">
                    [Q] CYBER CAGE SANDBOX
                  </span>
                  <Lock className="w-4 h-4 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold">{t.abilities.q.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {t.abilities.q.desc}
                </p>
              </div>

              {/* Ability E */}
              <div className="p-6 rounded-3xl border border-emerald-500/20 bg-card flex flex-col gap-3 hover:border-emerald-500/40 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                    [E] SPYCAM STREAMING
                  </span>
                  <Eye className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold">{t.abilities.e.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {t.abilities.e.desc}
                </p>
              </div>

              {/* Ability X */}
              <div className="p-6 rounded-3xl border border-amber-500/20 bg-card flex flex-col gap-3 hover:border-amber-500/40 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs border border-amber-500/20">
                    [X] NEURAL THEFT PROFILER
                  </span>
                  <Cpu className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold">{t.abilities.x.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {t.abilities.x.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Valorant Agent Leaderboard */}
          <div className="w-full max-w-5xl text-left">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-sky-500 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> {t.leaderboard.title}
              </h2>
              <span className="text-xs text-muted-foreground font-mono font-bold">{t.metrics.season}</span>
            </div>

            <div className="rounded-3xl border border-sky-500/20 overflow-hidden shadow-lg bg-card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/40">
                    <tr>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground w-16">
                        {t.leaderboard.rank}
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                        {t.leaderboard.agent}
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                        {t.leaderboard.school}
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                        {t.leaderboard.badge}
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-right text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                        {t.leaderboard.points}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-mono font-medium">
                    {AGENT_STUDENT_LEADERBOARD.map((agent) => (
                      <tr key={agent.rank} className="hover:bg-sky-500/5 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-sky-500">#{agent.rank}</td>
                        <td className="px-4 py-3.5 font-bold text-foreground">{agent.name}</td>
                        <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">{agent.school}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full border text-[10px] ${agent.color} bg-background border-current/20`}>
                            {agent.badge}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-amber-500 font-mono">{agent.points}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="w-full max-w-5xl text-left">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-sky-500 border-b border-border pb-3 mb-6 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-500" /> FAQ
            </h2>

            <div className="flex flex-col gap-3">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="rounded-2xl border border-sky-500/20 overflow-hidden bg-card shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-5 text-left font-bold text-sm md:text-base flex items-center justify-between gap-4 text-foreground hover:text-sky-500 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openFaq === idx ? "rotate-180 text-sky-500" : "text-muted-foreground"}`} />
                  </button>

                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs md:text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-3 font-medium">
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

        {/* Footer with Agent Cypher Voiceline */}
        <footer className="py-8 border-t border-border text-center text-xs text-muted-foreground mt-auto bg-muted/20">
          <p>© 2026 Cypher OJ. &ldquo;Give me a corpse, and I&#39;ll find them.&rdquo;</p>
        </footer>
      </div>
    </PageTransition>
  );
}
