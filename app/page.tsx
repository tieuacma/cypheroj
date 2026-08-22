"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, Shield, Cpu, Activity, ArrowRight, Eye } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";
import { PageTransition } from "@/components/PageTransition";
import { useEffect } from "react";
import { getStatsAction } from "@/lib/actions/problems";

export default function Home() {
  // Keep server-rendered markup stable to avoid hydration mismatch.
  const [stats, setStats] = useState<{ problems: number; submissions: number }>(() => ({
    problems: 0,
    submissions: 0,
  }));

  useEffect(() => {
    getStatsAction()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error("Failed to fetch stats", err);
      });
  }, []);


  return (
    <PageTransition>
      <div className="min-h-screen bg-background cyber-grid scanline text-foreground flex flex-col">

      {/* Header */}
      <header className="border-b border-cypher-border bg-cypher-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-cypher-cyan/10 border border-cypher-cyan flex items-center justify-center shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              <Terminal className="w-4.5 h-4.5 text-cypher-cyan animate-pulse" />
            </div>
            <span className="text-xl font-black tracking-widest text-shimmer">
              CYPHER<span className="text-cypher-cyan">.OJ</span>
            </span>
          </Link>
          
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/problems" className="text-sm font-medium hover:text-cypher-cyan transition-colors hidden sm:block">
              Kho bài tập
            </Link>
            <ThemeToggle />
            <MobileMenu />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-20 flex flex-col justify-center items-center text-center gap-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cypher-cyan/30 bg-cypher-cyan/5 text-xs font-semibold text-cypher-cyan uppercase tracking-widest mb-2 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
            <Shield className="w-3.5 h-3.5" /> Secure Hacker Terminal Connected
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-foreground leading-tight">
            I know <span className="text-cypher-cyan drop-shadow-[0_0_25px_rgba(14,165,233,0.5)]">exactly</span> where they are.
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-cypher-muted mt-2 leading-relaxed font-medium">
            Cypher Online Judge — tactical C++ coding chamber. Run your scripts, isolate memory leaks, and deploy solutions to the matrix.
          </p>
        </motion.div>

        {/* Action Button & Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full flex flex-col items-center gap-10"
        >
          <Link href="/problems" className="group btn-glow relative px-10 py-5 bg-cypher-cyan text-zinc-950 font-black tracking-wider uppercase rounded-2xl transition-all duration-300 hover:bg-cypher-cyan/90 hover:scale-105 hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] border-2 border-transparent hover:border-cypher-cyan/30">
            <span className="flex items-center gap-3 text-lg">
              Truy cập Kho bài tập <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
          </Link>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="cyber-panel card-hover p-8 rounded-2xl flex items-center gap-5 hover:border-cypher-cyan/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] group"
            >
              <div className="w-14 h-14 rounded-xl bg-cypher-cyan/10 flex items-center justify-center text-cypher-cyan group-hover:scale-110 transition-transform">
                <Cpu className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold text-foreground">{stats.problems}</div>
                <div className="text-sm uppercase tracking-wider text-cypher-muted font-medium">Bài tập nạp sẵn</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="cyber-panel card-hover p-8 rounded-2xl flex items-center gap-5 hover:border-cypher-warning/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] group"
            >
              <div className="w-14 h-14 rounded-xl bg-cypher-warning/10 flex items-center justify-center text-cypher-warning group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold text-foreground">{stats.submissions}</div>
                <div className="text-sm uppercase tracking-wider text-cypher-muted font-medium">Submission gần đây</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="cyber-panel card-hover p-8 rounded-2xl flex items-center gap-5 hover:border-cypher-success/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] group"
            >
              <div className="w-14 h-14 rounded-xl bg-cypher-success/10 flex items-center justify-center text-cypher-success group-hover:scale-110 transition-transform">
                <Eye className="w-7 h-7 subtle-pulse" />
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold text-cypher-success">ACTIVE</div>
                <div className="text-sm uppercase tracking-wider text-cypher-muted font-medium">Spycam Status</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Decorative Cypher ASCII Wire */}
        <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-cypher-border to-transparent mt-8" />
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-cypher-border text-center text-xs text-cypher-muted">
        <p>© 2026 Cypher OJ. &ldquo;Give me a corpse, and I&#39;ll find them.&rdquo;</p>
      </footer>
    </div>
    </PageTransition>
  );
}
