import type { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <section className="card stat-card">
      <div className="stat-card-top">
        <h2>{title}</h2>
        <span className="stat-icon">
          <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
        </span>
      </div>
      <p className="stat-value" aria-label="Dados ainda não disponíveis">
        —
      </p>
      <p className="stat-description">{description}</p>
    </section>
  );
}
