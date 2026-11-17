import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: "neutral" | "brand";
}) {
  return (
    <span className={cn("badge", variant === "brand" && "badge-brand")}>
      {children}
    </span>
  );
}
