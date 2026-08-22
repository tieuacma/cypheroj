"use client";

import { motion } from "framer-motion";
import type { TestcaseVerdict } from "@/lib/types";

interface TestcaseCellProps {
  index: number;
  status: TestcaseVerdict;
}

const statusConfig: Record<
  TestcaseVerdict,
  { label: string; className: string; textClass: string }
> = {
  pending: {
    label: String(0),
    className:
      "bg-zinc-200 text-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-600",
    textClass: "text-zinc-400 dark:text-zinc-600",
  },
  running: {
    label: "...",
    className:
      "border-2 border-cyan-400 bg-cyan-500/10 radar-blink text-cyan-400",
    textClass: "text-cyan-400",
  },
  ac: {
    label: "AC",
    className: "bg-green-500/20 border border-green-500 glow-flash",
    textClass: "text-green-500 font-bold",
  },
  wa: {
    label: "WA",
    className: "bg-red-500/20 border border-red-500 shake",
    textClass: "text-red-500 font-bold",
  },
  tle: {
    label: "TLE",
    className: "bg-amber-500/20 border border-amber-500 shake",
    textClass: "text-amber-500 font-bold text-[10px]",
  },
  re: {
    label: "RE",
    className: "bg-red-500/20 border border-red-500 shake",
    textClass: "text-red-500 font-bold",
  },
  ce: {
    label: "CE",
    className: "bg-red-500/20 border border-red-500 shake",
    textClass: "text-red-500 font-bold",
  },
};

const resultStatuses: TestcaseVerdict[] = ["ac", "wa", "tle", "re", "ce"];

export function TestcaseCell({ index, status }: TestcaseCellProps) {
  const config = statusConfig[status];
  const displayLabel =
    status === "pending" ? String(index) : config.label;
  const isResult = resultStatuses.includes(status);

  return (
    <motion.div
      key={`${index}-${status}`}
      layout
      initial={
        isResult
          ? { opacity: 0, scale: 0.5, rotateY: 90 }
          : { opacity: 1, scale: 1, rotateY: 0 }
      }
      animate={{
        opacity: 1,
        scale: status === "running" ? 1.05 : 1,
        rotateY: 0,
      }}
      transition={{
        scale: { duration: 0.2 },
        rotateY: { duration: 0.4, ease: "easeInOut" },
        opacity: { duration: 0.25 },
      }}
      className={`flex aspect-square items-center justify-center rounded-md text-xs font-medium ${config.className}`}
    >
      <span className={config.textClass}>{displayLabel}</span>
    </motion.div>
  );
}
