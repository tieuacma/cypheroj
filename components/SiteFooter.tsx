"use client";

import Link from "next/link";
import { Eye, Code2, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-cypher-border/60 bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cypher-accent-soft border border-cypher-cyan/30 flex items-center justify-center">
                <Eye className="w-4 h-4 text-cypher-cyan" />
              </div>
              <span className="font-black font-mono tracking-wider">
                CYPHER<span className="text-cypher-cyan">.OJ</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="cypher-section-label mb-3">{t.footer.learn}</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/problems" className="text-muted-foreground hover:text-cypher-cyan transition-colors flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" /> {t.nav.problems}
                </Link>
              </li>
              <li>
                <Link href="/problems/create" className="text-muted-foreground hover:text-cypher-cyan transition-colors flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5" /> {t.nav.create}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="cypher-section-label mb-3">{t.footer.agentIntel}</h4>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              &ldquo;{t.footer.quote}&rdquo;
            </p>
            <p className="text-[10px] font-mono text-cypher-muted mt-2">— Agent Cypher</p>
          </div>
        </div>

        <div className="pt-6 border-t border-border/50 text-center text-[11px] text-muted-foreground font-mono">
          © 2026 Cypher OJ · {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
