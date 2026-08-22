import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-cypher-border/30 via-cypher-border/50 to-cypher-border/30",
        "bg-[length:200%_100%]",
        className
      )}
      style={{
        animation: 'shimmer-skeleton 1.5s infinite',
      }}
      {...props}
    />
  );
}

export { Skeleton };
