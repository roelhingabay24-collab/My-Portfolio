import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const INTERACTIVE = 'a, button, [role="button"], label, summary';
const TEXT_ENTRY = 'input, textarea, select, [contenteditable="true"]';

// Mouse-only cursor: a dot that tracks exactly, plus a ring that trails on a
// spring, grows over interactive elements, and shows a label over anything
// marked data-cursor="…". Text fields get the native caret back.
export default function Cursor() {
  const [state, setState] = useState({ visible: false, mode: 'default', label: '' });

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('has-cursor');

    const onMove = (event) => {
      if (event.pointerType !== 'mouse') return;
      x.set(event.clientX);
      y.set(event.clientY);
      setState((current) => (current.visible ? current : { ...current, visible: true }));
    };

    const onOver = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const labelled = target.closest('[data-cursor]');
      let next;
      if (target.closest(TEXT_ENTRY)) next = { mode: 'text', label: '' };
      else if (labelled) next = { mode: 'label', label: labelled.getAttribute('data-cursor') };
      else if (target.closest(INTERACTIVE)) next = { mode: 'hover', label: '' };
      else next = { mode: 'default', label: '' };
      setState((current) => (
        current.mode === next.mode && current.label === next.label ? current : { ...current, ...next }
      ));
    };

    const onLeave = () => setState((current) => ({ ...current, visible: false }));

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [x, y]);

  const className = `cursor is-${state.mode} ${state.visible ? 'is-visible' : ''}`;

  return (
    <div className={className} aria-hidden="true">
      <motion.span className="cursor-ring" style={{ x: ringX, y: ringY }}>
        <span className="cursor-label">{state.label}</span>
      </motion.span>
      <motion.span className="cursor-dot" style={{ x, y }} />
    </div>
  );
}
