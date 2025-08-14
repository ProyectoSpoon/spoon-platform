import React from 'react';
import { cn } from '../../../lib/utils';
import { SkeletonV2 } from '../SkeletonV2';

export interface Column<T> {
  key: keyof T | string;
  header: React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface TableV2Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: React.ReactNode;
  className?: string;
}

export function TableV2<T extends Record<string, any>>({ columns, data, loading = false, emptyMessage = 'Sin datos', className, }: TableV2Props<T>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead className="bg-[color:var(--sp-neutral-50)] text-[color:var(--sp-neutral-700)]">
          <tr>
            {columns.map((c, i) => (
              <th key={i} scope="col" className={cn('text-left font-medium px-4 py-2 border-b', c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(3)].map((_, r) => (
              <tr key={`s-${r}`} className="border-b">
                {columns.map((_, c) => (
                  <td key={c} className="px-4 py-3">
                    <SkeletonV2 variant="text" className="w-32 h-4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-[color:var(--sp-neutral-500)]" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr key={ri} className="border-b">
                {columns.map((col, ci) => (
                  <td key={ci} className={cn('px-4 py-3', col.className)}>
                    {col.cell ? col.cell(row) : String(row[col.key as keyof typeof row] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TableV2;
