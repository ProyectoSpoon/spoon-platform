"use client";

import { RefObject, useEffect } from 'react';

declare global {
  interface Window { __spAriaHideCountMap?: WeakMap<Element, number> }
}

/**
 * Sets aria-hidden and inert on all document.body children except the provided container element.
 * Ref-counted so multiple overlays can coexist. SSR-safe.
 */
export function useAriaHiddenOthers(containerRef: RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const node = containerRef.current;
    if (!node) return;

    // Find the top-level element under body that contains the provided node (portal root)
    let portalRoot: Element | null = node;
    while (portalRoot && portalRoot.parentElement && portalRoot.parentElement !== document.body) {
      portalRoot = portalRoot.parentElement;
    }
    if (!portalRoot || portalRoot.parentElement !== document.body) return;

    const map = (window.__spAriaHideCountMap ||= new WeakMap<Element, number>());
    const bodyChildren = Array.from(document.body.children);

    const hidden: Element[] = [];
    for (const el of bodyChildren) {
      if (el === portalRoot) continue;
      // Increment ref count
      const prevCount = map.get(el) ?? 0;
      if (prevCount === 0) {
        // Store previous aria-hidden value
        const prev = el.getAttribute('aria-hidden');
        (el as any).dataset.spPrevAriaHidden = prev ?? '__none__';
        el.setAttribute('aria-hidden', 'true');
        // inert improves focus management when supported
        el.setAttribute('inert', '');
      }
      map.set(el, prevCount + 1);
      hidden.push(el);
    }

    return () => {
      for (const el of hidden) {
        const prevCount = map.get(el) ?? 0;
        if (prevCount <= 1) {
          const prev = (el as any).dataset.spPrevAriaHidden;
          if (prev === '__none__' || prev === undefined) el.removeAttribute('aria-hidden');
          else el.setAttribute('aria-hidden', prev);
          el.removeAttribute('inert');
          delete (el as any).dataset.spPrevAriaHidden;
          map.delete(el);
        } else {
          map.set(el, prevCount - 1);
        }
      }
    };
  }, [active, containerRef]);
}

export default useAriaHiddenOthers;
