"use client";

import { useMemo } from "react";

import { renderMarkdownAndMath } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const html = useMemo(() => renderMarkdownAndMath(content), [content]);

  return (
    <div
      className={`prose dark:prose-invert max-w-none text-foreground prose-headings:text-foreground prose-p:leading-relaxed prose-code:text-sky-600 dark:prose-code:text-sky-400 prose-pre:bg-slate-900 prose-pre:text-slate-100 dark:prose-pre:bg-slate-950/90 prose-pre:border prose-pre:border-sky-500/20 prose-a:text-sky-500 hover:prose-a:underline ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
