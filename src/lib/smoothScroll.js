import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// One Lenis instance for the page. It drives its own rAF loop and uses native
// scroll underneath, so Framer's useScroll and IntersectionObserver keep working.
let lenis = null;

export function startSmoothScroll() {
  if (lenis) return lenis;
  lenis = new Lenis({ autoRaf: true, lerp: 0.1, wheelMultiplier: 1 });
  return lenis;
}

export function stopSmoothScroll() {
  lenis?.destroy();
  lenis = null;
}

export function getLenis() {
  return lenis;
}

export function scrollToTarget(href, { instant = false } = {}) {
  const target = href === '#home' ? 0 : document.querySelector(href);
  if (target === null) return;
  if (lenis) {
    // Lenis already honours the CSS scroll-padding-top that clears the header.
    lenis.scrollTo(target, { immediate: instant, duration: 1.2 });
    return;
  }
  if (target === 0) window.scrollTo({ top: 0, behavior: instant ? 'auto' : 'smooth' });
  else target.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
}
