"use client";

import { useEffect, useRef } from 'react';

declare global {
  interface Window { __spScrollLockCount?: number }
}

/**
 * Locks body scroll when active=true. SSR-safe and ref-counted so multiple overlays can coexist.
 */
export function useScrollLock(active: boolean) {
  const prevOverflowRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const body = document.body;

    const lock = () => {
      const count = (window.__spScrollLockCount ?? 0) + 1;
      window.__spScrollLockCount = count;
      if (count === 1) {
        // First lock: store previous overflow and apply hidden
        prevOverflowRef.current = body.style.overflow || '';
        (body as any).dataset.spPrevOverflow = prevOverflowRef.current as string;
        body.style.overflow = 'hidden';
      }
    };

    const unlock = () => {
      const count = Math.max((window.__spScrollLockCount ?? 0) - 1, 0);
      window.__spScrollLockCount = count;
      if (count === 0) {
        const prev = (body as any).dataset.spPrevOverflow ?? '';
        body.style.overflow = prev;
        delete (body as any).dataset.spPrevOverflow;
      }
    };

    if (active) lock();
    return () => { if (active) unlock(); };
  }, [active]);
}

export default useScrollLock;
