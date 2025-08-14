import React from 'react';
import { cn } from '../../../lib/utils';

export interface PaginationV2Props {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

export const PaginationV2: React.FC<PaginationV2Props> = ({ page, pageCount, onPageChange }) => {
  const go = (p: number) => onPageChange(clamp(p, 1, pageCount));
  const canPrev = page > 1;
  const canNext = page < pageCount;

  // simple window of pages
  const pages = React.useMemo(() => {
    const range: number[] = [];
    const start = clamp(page - 2, 1, Math.max(1, pageCount - 4));
    const end = clamp(start + 4, 1, pageCount);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }, [page, pageCount]);

  return (
    <nav className="inline-flex items-center gap-1" aria-label="Pagination">
      <button aria-label="Anterior" disabled={!canPrev} onClick={() => go(page - 1)} className={cn('px-2 py-1 rounded', canPrev ? 'bg-[color:var(--sp-neutral-100)] hover:bg-[color:var(--sp-neutral-200)]' : 'opacity-50 cursor-not-allowed')}>
        «
      </button>
    {pages.map(p => (
  <button key={p} aria-current={p === page ? 'page' : undefined} onClick={() => go(p)} className={cn('px-3 py-1 rounded', p === page ? 'bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]' : 'bg-[color:var(--sp-neutral-100)] hover:bg-[color:var(--sp-neutral-200)]')}>
          {p}
        </button>
      ))}
      <button aria-label="Siguiente" disabled={!canNext} onClick={() => go(page + 1)} className={cn('px-2 py-1 rounded', canNext ? 'bg-[color:var(--sp-neutral-100)] hover:bg-[color:var(--sp-neutral-200)]' : 'opacity-50 cursor-not-allowed')}>
        »
      </button>
    </nav>
  );
};

export default PaginationV2;
