"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CypherCardAccent = "cyan" | "purple" | "emerald" | "gold" | "teal";

interface CypherCardProps {
  children: ReactNode;
  className?: string;
  accent?: CypherCardAccent;
  hover?: boolean;
  topBar?: boolean;
}

const accentClass: Record<CypherCardAccent, string> = {
  cyan: "cypher-card-accent-cyan",
  purple: "cypher-card-accent-purple",
  emerald: "cypher-card-accent-emerald",
  gold: "cypher-card-accent-gold",
  teal: "cypher-card-accent-teal",
};

export function CypherCard({
  children,
  className,
  accent = "cyan",
  hover = true,
  topBar = true,
}: CypherCardProps) {
  return (
    <div
      className={cn(
        "cypher-card",
        accentClass[accent],
        hover && "cypher-card-hover",
        className
      )}
    >
      {topBar && <div className="cypher-card-top-bar" />}
      <div className="relative p-6">{children}</div>
    </div>
  );
}

interface CypherAbilityCardProps {
  abilityKey: "C" | "Q" | "E" | "X";
  title: string;
  description: string;
  icon: ReactNode;
  accent: CypherCardAccent;
  learnTopic?: string;
}

export function CypherAbilityCard({
  abilityKey,
  title,
  description,
  icon,
  accent,
  learnTopic,
}: CypherAbilityCardProps) {
  return (
    <CypherCard accent={accent} className="h-full">
      <div className="flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full font-mono font-bold text-xs border bg-background/50"
            style={{ borderColor: "color-mix(in srgb, var(--card-accent) 35%, transparent)", color: "var(--card-accent)" }}
          >
            [{abilityKey}] AGENT ABILITY
          </span>
          <div className="text-[var(--card-accent)]">{icon}</div>
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
        {learnTopic && (
          <div className="pt-3 border-t border-border/50">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              CP Topic →
            </span>
            <p className="text-xs font-semibold text-[var(--card-accent)] mt-0.5">{learnTopic}</p>
          </div>
        )}
      </div>
    </CypherCard>
  );
}

interface CypherLearningPathCardProps {
  level: string;
  title: string;
  description: string;
  topics: string[];
  icon: ReactNode;
  accent: CypherCardAccent;
  href?: string;
}

export function CypherLearningPathCard({
  level,
  title,
  description,
  topics,
  icon,
  accent,
}: CypherLearningPathCardProps) {
  return (
    <CypherCard accent={accent}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              background: "color-mix(in srgb, var(--card-accent) 12%, transparent)",
              borderColor: "color-mix(in srgb, var(--card-accent) 30%, transparent)",
              color: "var(--card-accent)",
            }}
          >
            {icon}
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground">
              {level}
            </span>
            <h3 className="text-base font-bold text-foreground mt-0.5">{title}</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        <ul className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <li
              key={topic}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-background/60"
              style={{
                borderColor: "color-mix(in srgb, var(--card-accent) 25%, transparent)",
                color: "var(--card-accent)",
              }}
            >
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </CypherCard>
  );
}
