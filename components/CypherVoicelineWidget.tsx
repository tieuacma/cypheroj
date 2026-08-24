"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Radio, Sparkles, MessageSquare } from "lucide-react";
import { getRandomVoiceline, type CypherVoiceline } from "@/lib/cypher-voicelines";
import { useLanguage } from "@/lib/language-context";

interface CypherVoicelineWidgetProps {
  type?: "hero" | "compiling" | "testcasePass" | "accepted" | "wrongAnswer" | "timeLimit" | "compilationError";
  customText?: { en: string; vi: string };
  className?: string;
}

export function CypherVoicelineWidget({
  type = "hero",
  customText,
  className = "",
}: CypherVoicelineWidgetProps) {
  const { lang } = useLanguage();
  const [voiceline, setVoiceline] = useState<CypherVoiceline>(() => {
    return customText
      ? { en: customText.en, vi: customText.vi }
      : getRandomVoiceline(type);
  });

  useEffect(() => {
    if (customText) {
      setVoiceline({ en: customText.en, vi: customText.vi });
    } else {
      setVoiceline(getRandomVoiceline(type));
    }
  }, [type, customText]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={voiceline.en}
        initial={{ opacity: 0, y: 5, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -5, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className={`p-3.5 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-background shadow-md flex items-center gap-3.5 ${className}`}
      >
        {/* Agent Cypher Avatar Eye */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shrink-0 shadow-sm shadow-sky-500/30">
          <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
            <Eye className="w-4 h-4 text-sky-400 animate-pulse" />
          </div>
        </div>

        {/* Voiceline Text */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-sky-500">
              AGENT CYPHER INTEL
            </span>
            <span className="text-[9px] font-mono text-muted-foreground px-1.5 py-0.2 rounded bg-muted">
              {voiceline.tag || "VOICELINE"}
            </span>
          </div>

          <p className="text-xs font-bold text-foreground leading-snug mt-0.5 italic truncate font-sans">
            &quot;{lang === "en" ? voiceline.en : voiceline.vi}&quot;
          </p>

          {/* Dual Translation subtitle preview */}
          <p className="text-[10px] text-muted-foreground/80 font-medium truncate font-sans">
            {lang === "en" ? `[VI: "${voiceline.vi}"]` : `[EN: "${voiceline.en}"]`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setVoiceline(getRandomVoiceline(type))}
          className="p-1.5 rounded-lg hover:bg-sky-500/10 text-muted-foreground hover:text-sky-500 transition-colors"
          title="Roll another Cypher quote"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
