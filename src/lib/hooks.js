import { useEffect, useRef, useState } from 'react';
import { getLenis } from './smoothScroll';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let scrollLocks = 0;

// Locks background scrolling while an overlay is open, preserving scrollbar width
// so the page underneath does not shift.
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    // Smooth scroll moves the window itself, so it has to be paused too. Counted,
    // because the lightbox locks on top of the dialog and must not unpause it.
    scrollLocks += 1;
    getLenis()?.stop();
    return () => {
      scrollLocks -= 1;
      if (scrollLocks === 0) getLenis()?.start();
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [locked]);
}

// Highlights the nav item for the section currently in view.
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5] },
    );
    ids.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

// Keeps Tab inside an open overlay, moves focus into it on open, and restores
// focus to whatever was focused before when it closes.
export function useFocusTrap(active, containerRef, { initialFocusRef } = {}) {
  useEffect(() => {
    if (!active) return undefined;
    const previouslyFocused = document.activeElement;

    const target = initialFocusRef?.current
      || containerRef.current?.querySelector(FOCUSABLE)
      || containerRef.current;
    target?.focus?.();

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const focusable = containerRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
    // initialFocusRef is a ref object; its identity is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, containerRef]);
}

// Runs a callback when Escape is pressed, unless something nested has taken over.
export function useEscape(active, onEscape) {
  const handler = useRef(onEscape);
  // Keep the ref current without writing to it during render.
  useEffect(() => {
    handler.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handler.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);
}

/* ── Back-button dismissal ──────────────────────────────────────────────
 *
 * Each open overlay owns one throwaway history entry, so Back closes the
 * top overlay instead of leaving the page, and nested overlays unwind in
 * order (lightbox first, then the dialog beneath it).
 *
 * This needs a single shared listener rather than one per overlay. With a
 * listener each, closing the lightbox by Escape calls history.back() to tidy
 * up its entry: and the dialog's own listener would see that popstate and
 * close itself too. So: one listener dispatching to the top of a stack, plus
 * a flag marking the back() calls we make ourselves.
 */
const overlayStack = [];
let expectingProgrammaticBack = false;
let popStateBound = false;

function handlePopState() {
  if (expectingProgrammaticBack) {
    expectingProgrammaticBack = false;
    return;
  }
  const top = overlayStack.pop();
  if (top) {
    top.dismissedByBack = true;
    top.dismiss();
  }
}

export function useDismissOnBack(active, onDismiss) {
  const handler = useRef(onDismiss);
  useEffect(() => {
    handler.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!active) return undefined;

    if (!popStateBound) {
      window.addEventListener('popstate', handlePopState);
      popStateBound = true;
    }

    const entry = { dismiss: () => handler.current(), dismissedByBack: false };
    overlayStack.push(entry);
    window.history.pushState({ overlay: true }, '');

    return () => {
      const at = overlayStack.indexOf(entry);
      if (at !== -1) overlayStack.splice(at, 1);
      // Closed by Escape or a button rather than Back: drop the entry we added
      // so the history stack does not accumulate dead states.
      if (!entry.dismissedByBack) {
        expectingProgrammaticBack = true;
        window.history.back();
      }
    };
  }, [active]);
}
