import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { getLenis } from '../lib/smoothScroll';

// Viewport heights of scrolling it takes to turn the ring by one photo.
const SCROLL_PER_PHOTO = 14;
const pad = (n) => String(n).padStart(2, '0');

// Photos stand around a 3D cylinder. The section pins while you scroll through
// it, and scroll progress turns the cylinder so each photo comes to the front
// in order, first to last. Only transform and opacity change per frame, and the
// per-card opacity is written straight to the DOM rather than through React state.
export default function GalleryRing({ photos, head, onOpen }) {
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const count = photos.length;
  const step = 360 / count;
  const [active, setActive] = useState(0);
  // Native lazy loading is unreliable for images inside 3D-rotated cards, so the
  // photos load eagerly once the section is about a screen away.
  const nearby = useInView(stageRef, { once: true, margin: '100% 0px 100% 0px' });

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start start', 'end end'] });
  const turn = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const angle = useTransform(turn, (progress) => -progress * step * (count - 1));
  // The radius lives in a CSS variable (set on measure), so resizing never re-renders.
  const ringTransform = useTransform(angle, (value) => `translateZ(calc(var(--ring-r) * -1)) rotateY(${value}deg)`);

  // Radius that seats the cards edge to edge around the cylinder, with a small gap.
  useEffect(() => {
    const stage = stageRef.current;
    const measure = () => {
      const width = cardRefs.current[0]?.offsetWidth || 300;
      const radius = (width * 1.1) / (2 * Math.tan(Math.PI / count));
      stage.style.setProperty('--ring-r', `${Math.round(radius)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [count]);

  // Cards fade as they turn away, and only those near the front take clicks.
  // Returns the index of the card nearest the front.
  const paintCards = useCallback((value) => {
    let nearest = 0;
    let closest = Infinity;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const offset = ((((index * step + value) % 360) + 540) % 360) - 180;
      const distance = Math.abs(offset);
      if (distance < closest) {
        closest = distance;
        nearest = index;
      }
      const facing = Math.cos((offset * Math.PI) / 180);
      card.style.opacity = distance > 105 ? '0' : Math.max(0.12, 0.2 + facing * 0.8).toFixed(3);
      card.style.pointerEvents = distance < 55 ? 'auto' : 'none';
    });
    return nearest;
  }, [step]);

  useMotionValueEvent(angle, 'change', (value) => {
    const nearest = paintCards(value);
    setActive((current) => (current === nearest ? current : nearest));
  });
  // First paint only styles the cards; the active index starts at 0, which is
  // where the ring rests before any scroll event arrives.
  useEffect(() => { paintCards(angle.get()); }, [paintCards, angle]);

  // Scrolls the page to the point where photo `index` faces front.
  const goTo = useCallback((index) => {
    const stage = stageRef.current;
    const target = Math.min(count - 1, Math.max(0, index));
    const top = stage.getBoundingClientRect().top + window.scrollY;
    const range = stage.offsetHeight - window.innerHeight;
    const y = top + range * (count > 1 ? target / (count - 1) : 0);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }, [count]);

  const current = photos[active];

  return (
    <div
      className="gallery-stage"
      ref={stageRef}
      style={{ height: `calc(100svh + ${count * SCROLL_PER_PHOTO}vh)` }}
    >
      <div className="gallery-pin">
        {head}

        <div className="gallery-scene">
          <motion.div className="gallery-ring" style={{ transform: ringTransform }}>
            {photos.map((photo, index) => (
              <button
                type="button"
                key={photo.src}
                ref={(node) => { cardRefs.current[index] = node; }}
                className={`gallery-card ${index === active ? 'is-active' : ''} ${photo.featured ? 'is-featured' : ''}`}
                style={{ transform: `rotateY(${index * step}deg) translateZ(var(--ring-r))` }}
                data-cursor={index === active ? 'Open' : undefined}
                aria-haspopup={index === active ? 'dialog' : undefined}
                aria-hidden={index !== active}
                tabIndex={index === active ? 0 : -1}
                aria-label={index === active
                  ? `Enlarge photo ${index + 1} of ${count}: ${photo.alt}`
                  : `Show photo ${index + 1} of ${count}: ${photo.caption}`}
                onFocus={() => { if (index !== active) goTo(index); }}
                onClick={() => (index === active ? onOpen(index) : goTo(index))}
              >
                {nearby && <img src={photo.src} alt="" draggable="false" />}
                <span className="gallery-card-number" aria-hidden="true">{pad(index + 1)} / {pad(count)}</span>
                {photo.featured && <span className="gallery-badge" aria-hidden="true">Highlight</span>}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="gallery-controls shell">
          <button
            type="button"
            className="icon-btn"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
            aria-label="Previous photo"
          >
            <span aria-hidden="true">←</span>
          </button>
          <p className="gallery-status" aria-live="polite">
            <span className="ring-count">{pad(active + 1)} / {pad(count)}</span>
            <span className="gallery-caption">{current.caption}</span>
          </p>
          <button
            type="button"
            className="icon-btn"
            onClick={() => goTo(active + 1)}
            disabled={active === count - 1}
            aria-label="Next photo"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
