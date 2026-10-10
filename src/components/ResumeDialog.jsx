import { useRef } from 'react';
import { motion } from 'framer-motion';
import { RESUME_PREVIEW, RESUME_URL } from '../data/site';
import { useDismissOnBack, useEscape, useFocusTrap, useScrollLock } from '../lib/hooks';

// On-page resume viewer. It shows a rendered image of the PDF page, because
// embedded PDFs behave differently in every browser (Android Chrome will not
// display one inline at all); the real PDF stays one click away.
export default function ResumeDialog({ reduceMotion, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useScrollLock(true);
  useFocusTrap(true, dialogRef, { initialFocusRef: closeRef });
  useEscape(true, onClose);
  useDismissOnBack(true, onClose);

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
        className="dialog resume-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-title"
        ref={dialogRef}
        initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="dialog-head">
          <div>
            <h2 id="resume-title">Resume</h2>
            <p>Roel Hingabay · PDF, 1 page</p>
          </div>
          <div className="resume-actions">
            <a className="btn btn-primary" href={RESUME_URL} download="Roel-Hingabay-Resume.pdf">
              Download PDF <span aria-hidden="true">↓</span>
            </a>
            <a
              className="btn btn-ghost"
              href={RESUME_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open resume PDF (opens in a new tab)"
            >
              Open PDF <span aria-hidden="true">↗</span>
            </a>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close resume" ref={closeRef}>
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>
        <div className="dialog-scroll resume-scroll" data-lenis-prevent>
          <img
            className="resume-page"
            src={RESUME_PREVIEW}
            alt="Resume of Roel Hingabay: work experience, projects, education, skills, and certifications. Download the PDF for the text version."
            width="1600"
            height="2262"
            decoding="async"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
