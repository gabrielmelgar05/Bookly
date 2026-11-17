import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("brand", small && "brand-small")}
      aria-label="Bookly, página inicial"
    >
      <span className="brand-symbol">
        <BookOpen aria-hidden="true" size={21} strokeWidth={2.1} />
      </span>
      <span>
        Bookly<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
