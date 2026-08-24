import Link from "next/link";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CypherButtonVariant = "primary" | "ghost";

interface CypherButtonBaseProps {
  children: ReactNode;
  className?: string;
  variant?: CypherButtonVariant;
}

interface CypherButtonProps
  extends CypherButtonBaseProps,
    ButtonHTMLAttributes<HTMLButtonElement> {}

interface CypherButtonLinkProps extends CypherButtonBaseProps {
  href: string;
}

const variantClass: Record<CypherButtonVariant, string> = {
  primary: "cypher-btn-primary",
  ghost: "cypher-btn-ghost",
};

export function CypherButton({
  children,
  className,
  variant = "primary",
  ...props
}: CypherButtonProps) {
  return (
    <button className={cn(variantClass[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function CypherButtonLink({
  children,
  className,
  variant = "primary",
  href,
}: CypherButtonLinkProps) {
  return (
    <Link href={href} className={cn(variantClass[variant], className)}>
      {children}
    </Link>
  );
}
