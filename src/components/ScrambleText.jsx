import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/';
const LOWER = 'abcdefghijklmnopqrstuvwxyz0123456789';

const randomGlyph = (char) => {
  const set = char === char.toLowerCase() && char !== char.toUpperCase() ? LOWER : UPPER;
  return set[Math.floor(Math.random() * set.length)];
};

// Decodes its text left-to-right through random glyphs. trigger="hover" plays
// when the parent (usually a link) is hovered or focused; trigger="view" plays
// once on first scroll into view. Assistive tech only ever reads the real text,
// and a hidden sizer keeps the width fixed so the layout never jitters.
export default function ScrambleText({ text, trigger = 'hover', enabled = false }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const frame = useRef(0);
  const [display, setDisplay] = useState(text);

  const play = useCallback(() => {
    cancelAnimationFrame(frame.current);
    const start = performance.now();
    const duration = Math.min(700, 220 + text.length * 35);
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const revealed = Math.floor(progress * text.length);
      let next = '';
      for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        next += i < revealed || char === ' ' ? char : randomGlyph(char);
      }
      setDisplay(next);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [text]);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || reduceMotion || !node) return undefined;

    if (trigger === 'view') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          play();
          observer.disconnect();
        },
        { threshold: 0.6 },
      );
      observer.observe(node);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame.current);
      };
    }

    const host = node.parentElement;
    host?.addEventListener('pointerenter', play);
    host?.addEventListener('focusin', play);
    return () => {
      host?.removeEventListener('pointerenter', play);
      host?.removeEventListener('focusin', play);
      cancelAnimationFrame(frame.current);
    };
  }, [enabled, play, reduceMotion, trigger]);

  return (
    <span className="scramble" ref={ref}>
      <span className="scramble-sizer" aria-hidden="true">
        {text}
      </span>
      <span className="scramble-live" aria-hidden="true">
        {display}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
