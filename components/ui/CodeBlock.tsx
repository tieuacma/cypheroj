"use client";

import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
  label?: string;
  code: string;
}

export function CodeBlock({ label, code }: CodeBlockProps) {
  return (
    <div className="relative rounded-lg border border-cypher-border bg-zinc-100 dark:bg-zinc-900/60">
      {label && (
        <div className="flex items-center justify-between border-b border-cypher-border px-3 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {label}
          </span>
          <CopyButton text={code} />
        </div>
      )}
      {!label && (
        <div className="absolute right-2 top-2 z-10">
          <CopyButton text={code} />
        </div>
      )}
      <pre className="overflow-x-auto p-3 font-mono text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
