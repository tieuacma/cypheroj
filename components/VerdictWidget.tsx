"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TestcaseCell } from "@/components/TestcaseCell";
import type {
  FinalVerdictStatus,
  SubmissionPhase,
  TestcaseVerdict,
} from "@/lib/types";

interface VerdictWidgetProps {
  visible: boolean;
  phase: SubmissionPhase;
  testcases: TestcaseVerdict[];
  finalVerdict?: FinalVerdictStatus;
  currentTestIndex?: number;
}

const COMPILING_MESSAGES = [
  "Cypher Matrix Compiling...",
  "Decrypting Source Code...",
  "Deploying Trap Wires...",
];

function getVerdictColor(status: FinalVerdictStatus): string {
  switch (status) {
    case "Accepted":
      return "text-green-500";
    case "Wrong Answer":
    case "Runtime Error":
    case "Compilation Error":
      return "text-red-500";
    case "Time Limit Exceeded":
      return "text-amber-500";
    default:
      return "text-foreground";
  }
}

export function VerdictWidget({
  visible,
  phase,
  testcases,
  finalVerdict,
  currentTestIndex = 0,
}: VerdictWidgetProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (phase !== "compiling" && phase !== "running") return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % COMPILING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [phase]);

  function renderStatusText() {
    if (phase === "done" && finalVerdict) {
      return (
        <motion.span
          key={finalVerdict}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`text-2xl font-bold ${getVerdictColor(finalVerdict)}`}
        >
          {finalVerdict}
        </motion.span>
      );
    }

    if (phase === "running") {
      return (
        <motion.span
          key={`running-${currentTestIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-shimmer text-2xl font-bold"
        >
          Spycam Running on Test {currentTestIndex}...
        </motion.span>
      );
    }

    if (phase === "compiling") {
      return (
        <motion.span
          key={messageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-shimmer text-2xl font-bold"
        >
          {COMPILING_MESSAGES[messageIndex]}
        </motion.span>
      );
    }

    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="mt-4 rounded-xl border border-cypher-border bg-cypher-surface p-4 shadow-lg"
        >
          <div className="mb-4 min-h-[36px]">{renderStatusText()}</div>

          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {testcases.map((status, i) => (
              <TestcaseCell key={i} index={i + 1} status={status} />
            ))}
          </div>

          {phase === "done" && finalVerdict && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 text-sm text-zinc-500 dark:text-zinc-400"
            >
              {finalVerdict === "Accepted"
                ? "All testcases passed. Mission complete."
                : "Trap triggered. Review your solution and try again."}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
