"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  CheckCircle2,
  XCircle,
  Zap,
  Crosshair,
  Volume2,
  VolumeX,
  Code2,
  Sparkles,
  ShieldCheck,
  Radio,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getRandomCypherQuote, type CypherVoiceline } from "@/lib/cypher-voicelines";
import { useLanguage } from "@/lib/language-context";
import { cypherAudio } from "@/lib/cypher-audio";

interface CypherSubmitAnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "compiling" | "evaluating" | "completed" | "error";
  passedCount?: number;
  totalCount?: number;
  verdictText?: string;
  verdictScore?: number;
  codeSnippet?: string;
}

export function CypherSubmitAnimationModal({
  isOpen,
  onClose,
  status,
  passedCount = 0,
  totalCount = 20,
  verdictText = "ACCEPTED",
  verdictScore = 100,
  codeSnippet,
}: CypherSubmitAnimationModalProps) {
  const { lang } = useLanguage();
  const [voiceline, setVoiceline] = useState<CypherVoiceline>(() => getRandomCypherQuote("ability_e"));
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play audio triggers on status changes
  useEffect(() => {
    if (!isOpen) return;

    if (status === "compiling") {
      setVoiceline(getRandomCypherQuote("ability_q")); // Cyber Cage
      cypherAudio.playScanSweep();
    } else if (status === "evaluating") {
      setVoiceline(getRandomCypherQuote("ability_e")); // Spycam
      cypherAudio.playPing(960, 0.1);
    } else if (status === "completed") {
      if (verdictText === "ACCEPTED" || verdictScore === 100) {
        setVoiceline(getRandomCypherQuote("win"));
        cypherAudio.playVictoryChime();
      } else {
        setVoiceline(getRandomCypherQuote("kill"));
        cypherAudio.playAlertTone();
      }
    } else if (status === "error") {
      setVoiceline(getRandomCypherQuote("buy"));
      cypherAudio.playAlertTone();
    }
  }, [isOpen, status, verdictText, verdictScore]);

  // Audio ping on testcase progress
  useEffect(() => {
    if (isOpen && status === "evaluating" && passedCount > 0) {
      cypherAudio.playPing(750 + passedCount * 15, 0.06);
    }
  }, [isOpen, status, passedCount]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    cypherAudio.setEnabled(next);
    if (next) cypherAudio.playPing(1000, 0.05);
  };

  if (!isOpen) return null;

  const isAccepted = verdictText === "ACCEPTED" || verdictScore === 100;
  const progressPercent = status === "compiling" ? 25 : Math.min(100, Math.max(10, Math.round((passedCount / totalCount) * 100)));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md selection:bg-sky-500/30">
        {/* Animated Cyber Grid & Matrix Background Overlay */}
        <div className="absolute inset-0 cyber-grid-2d-overlay opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-sky-500/10 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 30 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="relative w-full max-w-xl rounded-3xl border-2 border-sky-500/40 bg-zinc-950 text-zinc-100 p-5 sm:p-7 shadow-[0_0_60px_rgba(14,165,233,0.35)] overflow-hidden flex flex-col gap-5"
        >
          {/* Hologram Flicker Border Glow */}
          <div className="absolute inset-0 rounded-3xl border border-cyan-400/30 pointer-events-none animate-hologram" />

          {/* Header HUD Bar */}
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-4">
            <div className="flex items-center gap-3">
              {/* Agent Cypher Fedora Avatar Vector Icon */}
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/40">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <svg
                    className="w-7 h-7 text-cyan-400 animate-cypher-eye"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    {/* Cypher Fedora Hat Top */}
                    <path d="M4 11h16M7 11V8a3 3 0 013-3h4a3 3 0 013 3v3" strokeLinecap="round" />
                    {/* Cyber Mask & Glowing Eye Sensor */}
                    <circle cx="12" cy="15" r="2.5" fill="currentColor" className="text-sky-400 animate-pulse" />
                    <path d="M8 15h2M14 15h2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-mono font-black tracking-widest text-sky-400 flex items-center gap-1.5 uppercase">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> Agent Cypher // Intel Scanner
                </span>
                <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Neural Feed Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl bg-zinc-900 border border-sky-500/30 text-sky-400 hover:text-cyan-300 hover:border-sky-400 transition-all"
                title={soundEnabled ? "Tắt âm thanh SFX" : "Bật âm thanh SFX"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              </button>

              <span className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/40 text-[10px] font-mono font-extrabold uppercase tracking-wider">
                {status === "compiling" && "CYBER CAGE BUILD"}
                {status === "evaluating" && "SPYCAM EVAL"}
                {status === "completed" && "NEURAL VERDICT"}
                {status === "error" && "SYSTEM ERROR"}
              </span>
            </div>
          </div>

          {/* Central Cyber Matrix & Reticle Core */}
          <div className="relative flex flex-col items-center justify-center py-2 gap-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer Spin Ring 1 */}
              <div className="absolute inset-0 rounded-full border-2 border-sky-500/20 border-t-sky-400 border-b-cyan-300 animate-reticle-spin" />
              {/* Inner Spin Ring 2 */}
              <div className="absolute inset-3 rounded-full border border-dashed border-cyan-400/50 animate-reticle-spin-reverse" />
              {/* Pulse Ring 3 */}
              <div className="absolute inset-6 rounded-full border border-sky-400/30 animate-ping opacity-25" />

              {/* Agent Cypher Silhouette & Spycam Iris Core */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-sky-500/20 to-zinc-950 border border-sky-400/60 flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.4)] relative">
                <div className="absolute inset-0 rounded-full bg-sky-400/10 animate-pulse" />
                <Eye className="w-10 h-10 text-cyan-300 animate-cypher-eye relative z-10" />

                {/* Reticle Target Crosshairs */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-sky-400/80" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-sky-400/80" />
                <div className="absolute left-1 top-1/2 -translate-y-1/2 h-0.5 w-2 bg-sky-400/80" />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 h-0.5 w-2 bg-sky-400/80" />
              </div>
            </div>

            {/* Stage Status Headline */}
            <div className="text-center flex flex-col items-center gap-1 max-w-md">
              <span className="text-sm font-mono font-black tracking-wider text-cyan-300 uppercase">
                {status === "compiling" && "PHASE 1: G++ 17 CYBER CAGE COMPILATION..."}
                {status === "evaluating" && `PHASE 2: SPYCAM SCANNING TESTCASES (${passedCount}/${totalCount})`}
                {status === "completed" && (isAccepted ? "PHASE 3: VERDICT CONFIRMED — ACCEPTED!" : `PHASE 3: VERDICT EVALUATED — ${verdictText}`)}
                {status === "error" && "LỖI HỆ THỐNG KHI CHẤM BÀI"}
              </span>

              {/* Animated Laser Code Scanner Box */}
              {codeSnippet && status !== "completed" && (
                <div className="w-full relative bg-zinc-900/90 rounded-xl p-3 border border-sky-500/30 overflow-hidden font-mono text-[11px] text-sky-300 text-left my-1 max-h-24 shadow-inner">
                  {/* Vertical Laser Scan Bar */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-cypher-laser pointer-events-none z-10" />
                  <pre className="text-zinc-400 opacity-80 overflow-hidden text-ellipsis whitespace-pre-wrap line-clamp-3">
                    {codeSnippet}
                  </pre>
                </div>
              )}

              {/* Progress Bar & Testcase Dots */}
              {status !== "completed" && (
                <div className="w-full max-w-sm flex flex-col gap-2 mt-1">
                  <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-sky-500/30 p-0.5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>

                  {/* Simulated Testcases Grid Pills */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 px-1">
                    <span>PROGRESS: {progressPercent}%</span>
                    <span>TESTS: {passedCount} / {totalCount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cypher Live Voiceline Transmission Box */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-sky-500/30 text-sky-300 flex flex-col gap-1.5 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-sky-400" />
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-b border-zinc-800 pb-1">
              <span className="font-bold text-sky-400 flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> CYPHER TRANSMISSION
              </span>
              <span className="bg-sky-500/10 px-2 py-0.5 rounded text-sky-400 border border-sky-500/20 font-extrabold">
                {voiceline.tag || "INTEL"}
              </span>
            </div>

            <p className="text-sm font-extrabold italic text-zinc-100 font-sans mt-0.5 leading-snug">
              &quot;{lang === "en" ? voiceline.en : voiceline.vi}&quot;
            </p>
            <p className="text-[11px] text-zinc-400 italic font-mono">
              {lang === "en" ? `[VI: "${voiceline.vi}"]` : `[EN: "${voiceline.en}"]`}
            </p>
          </div>

          {/* Verdict Banner & Action Button */}
          {status === "completed" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3"
            >
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isAccepted
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isAccepted ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce" />
                  ) : (
                    <XCircle className="w-7 h-7 text-red-400 animate-pulse" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-black uppercase tracking-wider">
                      {isAccepted ? "ACCEPTED (CHÍNH XÁC HOÀN HẢO)" : `VERDICT: ${verdictText}`}
                    </span>
                    <span className="text-[11px] text-zinc-300 font-mono">
                      {isAccepted
                        ? `Agent Cypher xác nhận: ${verdictScore}đ điểm tuyệt đối!`
                        : `Agent Cypher ghi nhận: ${verdictScore}đ (${passedCount}/${totalCount} testcase vượt qua)`}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black font-mono px-3 py-1 rounded-xl bg-zinc-950 border border-current">
                  {isAccepted ? "100đ" : `${verdictScore}đ`}
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-600 text-zinc-950 font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" /> Xem Kết Quả Chi Tiết Bài Nộp
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
