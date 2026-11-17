import type { ReactNode } from "react";

export function ResourceList({
  columns,
  label,
  children,
}: {
  columns: readonly string[];
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="resource-list">
      <table aria-label={label}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={columns.length}>{children}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
