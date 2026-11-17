import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Appearance = { variant?: Variant; compact?: boolean };

export function Button({
  variant = "primary",
  compact,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & Appearance) {
  return (
    <button
      type={type}
      className={cn(
        "button",
        `button-${variant}`,
        compact && "button-compact",
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  compact,
  className,
  ...props
}: ComponentProps<typeof Link> & Appearance) {
  return (
    <Link
      className={cn(
        "button",
        `button-${variant}`,
        compact && "button-compact",
        className,
      )}
      {...props}
    />
  );
}
