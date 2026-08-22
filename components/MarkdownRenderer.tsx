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
      className={`prose dark:prose-invert max-w-none text-foreground prose-headings:text-foreground prose-p:leading-relaxed prose-code:text-cypher-cyan prose-pre:bg-zinc-950/80 prose-pre:border prose-pre:border-cypher-border prose-a:text-cypher-cyan ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
