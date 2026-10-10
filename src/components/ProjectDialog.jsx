import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lightbox from './Lightbox';
import { useDismissOnBack, useEscape, useFocusTrap, useScrollLock } from '../lib/hooks';
import { morph, projectMediaId } from '../lib/motion';
import { createSwipeNavigation } from '../lib/swipeNavigation';

export default function ProjectDialog({ project, reduceMotion, onClose }) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const count = project.gallery.length;

  const next = useCallback(() => setIndex((current) => (current + 1) % count), [count]);
  const prev = useCallback(() => setIndex((current) => (current - 1 + count) % count), [count]);
  const swipe = useMemo(
    () => createSwipeNavigation({ enabled: count > 0 && !zoomed, onNext: next, onPrev: prev }),
    [count, zoomed, next, prev],
  );

  useScrollLock(true);
  useFocusTrap(true, dialogRef, { initialFocusRef: closeRef });
  // While the lightbox is open it owns Escape; this dialog stands down. Back is
  // handled by the shared overlay stack, so this stays registered throughout ,
  // deregistering it here would release its history entry and close the lightbox.
  useEscape(!zoomed, onClose);
  useDismissOnBack(true, onClose);

  useEffect(() => {
    if (zoomed || count < 2) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [zoomed, count, next, prev]);

  const titleId = `project-${project.number}-title`;
  // Shared with the card thumbnail in Work, so the preview grows into the dialog.
  const mediaLayoutId = reduceMotion ? undefined : projectMediaId(project.number);
  const currentCaption = project.galleryCaptions?.[index];
  const currentAlt = currentCaption ? `${project.title}: ${currentCaption}` : `${project.title} screenshot ${index + 1} of ${count}`;

  return (
    <motion.div
      className="dialog-backdrop"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <motion.div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.99 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="dialog-head">
          <div>
            <h2 id={titleId}>{project.title}</h2>
            <p>{project.number} · {project.type} · {project.year}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close project" ref={closeRef}>
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <motion.div className="dialog-scroll" data-lenis-prevent layoutScroll>
          {count > 0 ? (
            <>
              <motion.div className="dialog-figure" layoutId={mediaLayoutId} transition={morph}>
                <button
                  type="button"
                  className={`figure-zoom${count > 1 ? ' is-swipeable' : ''}`}
                  {...swipe}
                  onClick={() => setZoomed(true)}
                  aria-label={`Enlarge ${currentAlt}`}
                >
                  <motion.img layout={mediaLayoutId ? true : undefined} src={project.gallery[index]} alt={currentAlt} decoding="async" />
                </button>
                {count > 1 && (
                  <div className="gallery-nav">
                    <button type="button" onClick={prev} aria-label="Previous screenshot">
                      <span aria-hidden="true">←</span>
                    </button>
                    <p className="gallery-count" aria-live="polite">{index + 1} / {count}</p>
                    <button type="button" onClick={next} aria-label="Next screenshot">
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                )}
              </motion.div>

              {currentCaption && <p className="dialog-image-caption">{currentCaption}</p>}

              {count > 1 && (
                <div className="thumbs">
                  {project.gallery.map((image, thumbIndex) => (
                    <button
                      type="button"
                      key={image}
                      aria-current={thumbIndex === index ? 'true' : undefined}
                      aria-label={project.galleryCaptions?.[thumbIndex] || `Show screenshot ${thumbIndex + 1}`}
                      onClick={() => setIndex(thumbIndex)}
                    >
                      <img src={image} alt="" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <motion.div className="dialog-figure" layoutId={mediaLayoutId} transition={morph}>
              <span className="work-empty">Preview coming soon</span>
            </motion.div>
          )}

          <dl className="dialog-facts">
            <div>
              <dt>Overview</dt>
              <dd>{project.description}</dd>
            </div>
            {project.problem && (
              <div>
                <dt>Problem</dt>
                <dd>{project.problem}</dd>
              </div>
            )}
            <div>
              <dt>Status</dt>
              <dd>{project.status}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Outcome</dt>
              <dd>{project.outcome}</dd>
            </div>
          </dl>

          <div className="work-tags dialog-tags">
            {project.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
          </div>
        </motion.div>

        <div className="dialog-foot">
          {project.link ? (
            <a className="btn btn-primary" href={project.link} target="_blank" rel="noreferrer">
              {project.linkLabel} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <p>Internal project. Details available on request.</p>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </motion.div>

      <AnimatePresence>
        {zoomed && (
          <Lightbox
            src={project.gallery[index]}
            alt={currentAlt}
            caption={currentCaption}
            index={index}
            count={count}
            onPrev={prev}
            onNext={next}
            onClose={() => setZoomed(false)}
            reduceMotion={reduceMotion}
            swipeEnabled
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
