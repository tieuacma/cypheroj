"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { OnMount } from "@monaco-editor/react";
import { RotateCcw } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/lib/theme-provider";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[360px] items-center justify-center text-sm text-zinc-500">
      Loading editor...
    </div>
  ),
});

const FONT_SIZES = [12, 14, 16, 18] as const;

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  defaultCode: string;
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, defaultCode, readOnly = false }: CodeEditorProps) {
  const { theme, mounted } = useTheme();
  const [fontSize, setFontSize] = useState<number>(14);
  const [isActive, setIsActive] = useState(false);

  const monacoTheme = mounted && theme === "dark" ? "vs-dark" : "light";

  const handleMount: OnMount = useCallback((editor) => {
    editor.onDidFocusEditorText(() => !readOnly && setIsActive(true));
    editor.onDidBlurEditorText(() => setIsActive(false));
  }, [readOnly]);

  function handleReset() {
    onChange(defaultCode);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-cypher-border bg-cypher-surface px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-cypher-muted uppercase tracking-wider">
            Font size
          </span>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="rounded-lg border border-cypher-border bg-transparent px-3 py-1.5 text-xs text-foreground outline-none focus:border-cypher-cyan focus:ring-2 focus:ring-cypher-cyan/20 transition-all cursor-pointer"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn-glow inline-flex items-center gap-2 rounded-lg border border-cypher-border px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-cypher-cyan hover:text-cypher-cyan hover:bg-cypher-cyan/5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Code
          </button>
          <ThemeToggle />
        </div>
      </div>

      <motion.div
        layout
        className={`overflow-hidden rounded-xl border cyan-glow ${isActive ? "cyan-glow-active" : ""}`}
        transition={{ duration: 0.3 }}
      >
        <MonacoEditor
          height="450px"
          language="cpp"
          theme={monacoTheme}
          value={value}
          onChange={(val) => onChange(val ?? "")}
          onMount={handleMount}
          options={{
            fontSize,
            fontFamily: "var(--font-geist-mono), monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            lineNumbers: "on",
            renderLineHighlight: readOnly ? "none" : "all",
            cursorBlinking: readOnly ? "blink" : "smooth",
            smoothScrolling: true,
            readOnly: readOnly,
            domReadOnly: readOnly,
          }}
        />
      </motion.div>
    </div>
  );
}
