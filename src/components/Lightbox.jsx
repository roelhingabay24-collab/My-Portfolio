import { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDismissOnBack, useEscape, useFocusTrap, useScrollLock } from '../lib/hooks';
import { createSwipeNavigation } from '../lib/swipeNavigation';

// Full-bleed view of a single screenshot. The dialog caps its figure at 44vh so
// the facts below stay visible, which is too small to actually read a dense admin
// UI: this is where you go to read it.
export default function Lightbox({
  src,
  pdf,
  documentUrl,
  alt,
  caption,
  variant,
  index,
  count,
  onPrev,
  onNext,
  onClose,
  reduceMotion,
  swipeEnabled = false,
}) {
  const ref = useRef(null);
  const canSwipe = swipeEnabled && count > 1 && !pdf;
  const swipe = useMemo(
    () => createSwipeNavigation({ enabled: canSwipe, onNext, onPrev }),
    [canSwipe, onNext, onPrev],
  );

  useScrollLock(true);
  useEscape(true, onClose);
  useFocusTrap(true, ref);
  useDismissOnBack(true, onClose);

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight' && count > 1) onNext();
    if (event.key === 'ArrowLeft' && count > 1) onPrev();
  };

  return (
    <motion.div
      className={`lightbox ${variant === 'photo' ? 'is-photo' : ''}`}
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      ref={ref}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
    >
      <div className="lightbox-bar">
        <p>
          {caption}
          {caption && count > 1 ? ' · ' : ''}
          {count > 1 ? `${index + 1} / ${count}` : ''}
        </p>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close viewer">
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      {pdf ? (
        <div className="lightbox-pdf">
          <iframe key={pdf} src={pdf} title={alt} />
          <a href={pdf} target="_blank" rel="noreferrer">
            Open certificate PDF in a new tab
          </a>
        </div>
      ) : (
        <motion.img
          key={src}
          className={`lightbox-image${canSwipe ? ' is-swipeable' : ''}`}
          {...swipe}
          src={src}
          alt={alt}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {documentUrl && (
        <a className="lightbox-document-link" href={documentUrl} target="_blank" rel="noreferrer">
          Open certificate PDF in a new tab
        </a>
      )}

      {count > 1 && (
        <div className="lightbox-nav">
          <button type="button" onClick={onPrev} aria-label="Previous item">
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" onClick={onNext} aria-label="Next item">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
