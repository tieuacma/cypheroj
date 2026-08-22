"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Cpu, Loader2, Send } from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { VerdictWidget } from "@/components/VerdictWidget";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { consumeNDJSONStream } from "@/lib/stream";
import {
  createInitialTestcases,
  DEFAULT_CPP_TEMPLATE,
  type FinalVerdictStatus,
  type Problem,
  type StreamEvent,
  type SubmissionPhase,
  type TestcaseVerdict,
} from "@/lib/types";

interface ProblemWorkspaceProps {
  problem: Problem;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export function ProblemWorkspace({ problem }: ProblemWorkspaceProps) {
  const [code, setCode] = useState(DEFAULT_CPP_TEMPLATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phase, setPhase] = useState<SubmissionPhase>("idle");
  const [widgetVisible, setWidgetVisible] = useState(false);
  const [testcases, setTestcases] = useState<TestcaseVerdict[]>(
    createInitialTestcases
  );
  const [finalVerdict, setFinalVerdict] = useState<
    FinalVerdictStatus | undefined
  >();
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  function handleStreamEvent(event: StreamEvent) {
    if (event.type === "compile") {
      if (event.status === "success") {
        setPhase("running");
      } else {
        setPhase("done");
        setFinalVerdict("Compilation Error");
      }
      return;
    }

    if (event.type === "testcase") {
      setCurrentTestIndex(event.index);
      setTestcases((prev) => {
        const next = [...prev];
        next[event.index - 1] = event.status;
        return next;
      });
      return;
    }

    if (event.type === "verdict") {
      setPhase("done");
      setFinalVerdict(event.status);
    }
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setPhase("compiling");
    setWidgetVisible(true);
    setFinalVerdict(undefined);
    setTestcases(createInitialTestcases());
    setCurrentTestIndex(0);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: problem.id,
          code,
        }),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      await consumeNDJSONStream(response, handleStreamEvent);
    } catch {
      setPhase("done");
      setFinalVerdict("Runtime Error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-cypher-border bg-cypher-surface px-4 py-3 lg:px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-widest text-cyan-500">
            CYPHER OJ
          </span>
          <span className="text-zinc-400">/</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Problem #{problem.id}
          </span>
        </div>
      </header>

      <div className="grid gap-6 p-4 lg:grid-cols-2 lg:p-6">
        <div className="flex flex-col gap-4">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="rounded-xl border border-cypher-border bg-cypher-surface p-5"
          >
            <h1 className="mb-3 text-2xl font-bold text-foreground">
              {problem.title}
            </h1>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-600 dark:text-cyan-400">
                <Clock className="h-3.5 w-3.5" />
                {problem.timeLimit} ms
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-600 dark:text-cyan-400">
                <Cpu className="h-3.5 w-3.5" />
                {problem.memoryLimit} MB
              </span>
            </div>
          </motion.div>

          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="rounded-xl border border-cypher-border bg-cypher-surface p-5"
          >
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-500">
              Statement
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {problem.statement}
            </p>
          </motion.div>

          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="rounded-xl border border-cypher-border bg-cypher-surface p-5"
          >
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-500">
              Input
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {problem.inputFormat}
            </p>
          </motion.div>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="rounded-xl border border-cypher-border bg-cypher-surface p-5"
          >
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-500">
              Output
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {problem.outputFormat}
            </p>
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="rounded-xl border border-cypher-border bg-cypher-surface p-5"
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-500">
              Sample Tests
            </h2>
            <div className="flex flex-col gap-4">
              {problem.samples.map((sample, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-zinc-500">
                    Sample #{i + 1}
                  </span>
                  <CodeBlock label="Input" code={sample.input} />
                  <CodeBlock label="Output" code={sample.output} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col">
          <CodeEditor
            value={code}
            onChange={setCode}
            defaultCode={DEFAULT_CPP_TEMPLATE}
          />

          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="radar-pulse mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-4 text-lg font-bold text-zinc-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Judging...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit
              </>
            )}
          </motion.button>

          <VerdictWidget
            visible={widgetVisible}
            phase={phase}
            testcases={testcases}
            finalVerdict={finalVerdict}
            currentTestIndex={currentTestIndex}
          />
        </div>
      </div>
    </div>
  );
}
