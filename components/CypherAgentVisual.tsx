"use client";

import { motion } from "framer-motion";

export function CypherAgentVisual({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-[280px] mx-auto aspect-square"
      >
        {/* Outer surveillance ring */}
        <div className="absolute inset-0 rounded-full border border-cypher-cyan/30 animate-reticle-spin" />
        <div className="absolute inset-3 rounded-full border border-dashed border-cypher-cyan/20 animate-reticle-spin-reverse" />

        {/* Crosshair lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-cypher-cyan/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-cypher-cyan/40 to-transparent" />
        </div>

        {/* Central eye HUD */}
        <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-cypher-cyan/15 via-background to-cypher-purple/10 border border-cypher-cyan/40 flex items-center justify-center cypher-agent-ring shadow-[0_0_40px_var(--cypher-glow)]">
          <svg viewBox="0 0 120 120" className="w-3/4 h-3/4 animate-cypher-eye" aria-hidden>
            <defs>
              <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--cypher-cyan)" />
                <stop offset="100%" stopColor="var(--cypher-gold)" />
              </linearGradient>
            </defs>
            {/* Eye outline */}
            <ellipse cx="60" cy="60" rx="48" ry="28" fill="none" stroke="url(#eyeGrad)" strokeWidth="2.5" />
            {/* Iris */}
            <circle cx="60" cy="60" r="18" fill="none" stroke="var(--cypher-cyan)" strokeWidth="2" opacity="0.8" />
            <circle cx="60" cy="60" r="8" fill="var(--cypher-cyan)" opacity="0.9" />
            <circle cx="63" cy="57" r="3" fill="var(--cypher-gold)" opacity="0.9" />
            {/* Trapwire corner marks */}
            <path d="M12 12 L12 28 M12 12 L28 12" stroke="var(--cypher-cyan)" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M108 12 L108 28 M108 12 L92 12" stroke="var(--cypher-cyan)" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M12 108 L12 92 M12 108 L28 108" stroke="var(--cypher-cyan)" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M108 108 L108 92 M108 108 L92 108" stroke="var(--cypher-cyan)" strokeWidth="2" fill="none" opacity="0.5" />
          </svg>
        </div>

        {/* Floating ability keys */}
        {(["C", "Q", "E", "X"] as const).map((key, i) => {
          const positions = [
            "top-2 left-1/2 -translate-x-1/2",
            "right-0 top-1/2 -translate-y-1/2",
            "bottom-2 left-1/2 -translate-x-1/2",
            "left-0 top-1/2 -translate-y-1/2",
          ];
          const colors = ["text-cypher-cyan", "text-cypher-purple", "text-cypher-success", "text-cypher-gold"];
          return (
            <motion.span
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`absolute ${positions[i]} w-8 h-8 rounded-lg border border-current/30 bg-card/90 flex items-center justify-center font-mono font-black text-sm ${colors[i]} shadow-lg`}
            >
              {key}
            </motion.span>
          );
        })}

        {/* Scan line */}
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          <div className="absolute left-0 right-0 h-8 bg-gradient-to-b from-cypher-cyan/20 to-transparent animate-cypher-laser" />
        </div>
      </motion.div>

      <p className="text-center text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mt-4">
        Agent Cypher · Surveillance Protocol
      </p>
    </div>
  );
}
