"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Eye, Sliders, Check, Layers, Play, Pause, RefreshCw } from "lucide-react";

export interface CyberGridBackgroundProps {
  /** Mode for grid: '2d' flat tactical grid, '3d' perspective cyberpunk floor grid, or 'off' */
  initialGridMode?: "2d" | "3d" | "off";
  /** Whether laser scanline beam is enabled */
  initialLaserEnabled?: boolean;
  /** Laser animation speed in seconds */
  initialLaserSpeed?: number;
}

export function CyberGridBackground({
  initialGridMode = "2d",
  initialLaserEnabled = true,
  initialLaserSpeed = 6,
}: CyberGridBackgroundProps) {
  const [gridMode, setGridMode] = useState<"2d" | "3d" | "off">(initialGridMode);
  const [laserEnabled, setLaserEnabled] = useState<boolean>(initialLaserEnabled);
  const [laserSpeed, setLaserSpeed] = useState<number>(initialLaserSpeed);
  const [isControlOpen, setIsControlOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Load user preferences from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const savedGrid = localStorage.getItem("cypher_grid_mode");
      if (savedGrid === "2d" || savedGrid === "3d" || savedGrid === "off") {
        setGridMode(savedGrid);
      }
      const savedLaser = localStorage.getItem("cypher_laser_enabled");
      if (savedLaser !== null) {
        setLaserEnabled(savedLaser === "true");
      }
      const savedSpeed = localStorage.getItem("cypher_laser_speed");
      if (savedSpeed) {
        const speed = parseFloat(savedSpeed);
        if (!isNaN(speed) && speed >= 2 && speed <= 15) {
          setLaserSpeed(speed);
        }
      }
    } catch {
      // Fallback to defaults if localStorage is unavailable
    }
  }, []);

  const handleGridModeChange = (mode: "2d" | "3d" | "off") => {
    setGridMode(mode);
    try {
      localStorage.setItem("cypher_grid_mode", mode);
    } catch {}
  };

  const handleLaserToggle = () => {
    const next = !laserEnabled;
    setLaserEnabled(next);
    try {
      localStorage.setItem("cypher_laser_enabled", String(next));
    } catch {}
  };

  const handleSpeedChange = (speed: number) => {
    setLaserSpeed(speed);
    try {
      localStorage.setItem("cypher_laser_speed", String(speed));
    } catch {}
  };

  if (!mounted) {
    return null; // Prevent SSR mismatch
  }

  return (
    <>
      {/* Background Container - Fixed & Non-blocking (Strictly behind all page content) */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* 2D Flat Tactical Cyber Grid */}
        {gridMode === "2d" && (
          <div className="absolute inset-0 cyber-grid-2d-overlay opacity-75 dark:opacity-55 transition-opacity duration-500" />
        )}

        {/* 3D Perspective Cyber Floor Grid */}
        {gridMode === "3d" && (
          <div className="absolute inset-0 perspective-grid-container opacity-65 dark:opacity-45 transition-opacity duration-500">
            <div className="perspective-grid-plane" />
          </div>
        )}

        {/* Tactical Corner Crosshairs & Grid Nodes */}
        {gridMode !== "off" && (
          <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-40">
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-sky-500/50" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-sky-500/50" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-sky-500/50" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-sky-500/50" />
          </div>
        )}

        {/* Laser Scanline Beam & Trail Animation (Animation Quét Laser) */}
        {laserEnabled && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Main Sweeping Laser Beam Line */}
            <div
              className="laser-scanline-beam"
              style={{
                animationDuration: `${laserSpeed}s`,
              }}
            >
              {/* Laser Beam Glow Line */}
              <div className="w-full h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff,0_0_30px_#0284c7]" />
              
              {/* Laser Trailing Soft Gradient Fade */}
              <div className="w-full h-16 bg-gradient-to-b from-cyan-500/15 via-sky-500/5 to-transparent -mt-[1px]" />
            </div>

            {/* Subtle Pulse Pulse Radar Node on Laser Beam */}
            <div
              className="laser-radar-dot"
              style={{
                animationDuration: `${laserSpeed}s`,
              }}
            />
          </div>
        )}
      </div>

      {/* Floating Tactical HUD Toggle Button & Controls Widget */}
      <div className="fixed bottom-4 right-4 z-40">
        <AnimatePresence>
          {isControlOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className="mb-3 w-64 p-4 rounded-2xl bg-background/95 border border-sky-500/30 backdrop-blur-md shadow-2xl text-xs flex flex-col gap-3 font-mono text-foreground"
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
                <span className="font-extrabold text-sky-500 flex items-center gap-1.5 uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5 animate-pulse" /> Cyber HUD Settings
                </span>
                <span className="text-[10px] text-muted-foreground font-bold">
                  {laserEnabled ? "LASER ACTIVE" : "LASER PAUSED"}
                </span>
              </div>

              {/* Grid Mode Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3 text-sky-500" /> Nền Cyber Grid:
                </label>
                <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-xl border border-sky-500/20">
                  <button
                    type="button"
                    onClick={() => handleGridModeChange("2d")}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                      gridMode === "2d"
                        ? "bg-sky-500 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    2D Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGridModeChange("3d")}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                      gridMode === "3d"
                        ? "bg-sky-500 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    3D Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGridModeChange("off")}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                      gridMode === "off"
                        ? "bg-rose-500 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Tắt
                  </button>
                </div>
              </div>

              {/* Laser Scanline Toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <span className="font-bold text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" /> Quét Laser:
                </span>
                <button
                  type="button"
                  onClick={handleLaserToggle}
                  className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1 ${
                    laserEnabled
                      ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {laserEnabled ? <Check className="w-3 h-3" /> : null}
                  {laserEnabled ? "Đang Bật" : "Đang Tắt"}
                </button>
              </div>

              {/* Laser Scan Speed Control */}
              {laserEnabled && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                    <span>Tốc độ quét Laser:</span>
                    <span className="text-sky-500 font-mono">{laserSpeed}s</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-xl border border-sky-500/20">
                    <button
                      type="button"
                      onClick={() => handleSpeedChange(3)}
                      className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        laserSpeed === 3 ? "bg-cyan-500 text-white" : "text-muted-foreground"
                      }`}
                    >
                      Nhanh (3s)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSpeedChange(6)}
                      className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        laserSpeed === 6 ? "bg-cyan-500 text-white" : "text-muted-foreground"
                      }`}
                    >
                      Chuẩn (6s)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSpeedChange(10)}
                      className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        laserSpeed === 10 ? "bg-cyan-500 text-white" : "text-muted-foreground"
                      }`}
                    >
                      Chậm (10s)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsControlOpen(!isControlOpen)}
          className="px-3 py-2 rounded-2xl bg-background/90 border border-sky-500/40 text-sky-500 hover:text-cyan-400 hover:border-sky-500 hover:bg-sky-500/10 transition-all shadow-lg backdrop-blur-md flex items-center gap-2 text-xs font-mono font-bold"
          title="Tùy chỉnh Cyber Grid & Laser Scanline"
        >
          <div className="relative flex items-center justify-center">
            <Zap className={`w-4 h-4 ${laserEnabled ? "text-cyan-400 animate-pulse" : "text-muted-foreground"}`} />
            {laserEnabled && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>
          <span className="hidden sm:inline">CYBER HUD</span>
          <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </>
  );
}
