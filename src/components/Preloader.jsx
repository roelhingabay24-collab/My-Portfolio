import { useEffect } from 'react';
import { motion } from 'framer-motion';

const INTRO_KEY = 'rh-intro-seen';
const ease = [0.76, 0, 0.24, 1];

// Only the first visit in a session gets the intro; reloads and reduced motion skip it.
export function shouldPlayIntro(reduceMotion) {
  if (reduceMotion) return false;
  try {
    if (window.sessionStorage.getItem(INTRO_KEY)) return false;
    window.sessionStorage.setItem(INTRO_KEY, '1');
  } catch {
    /* storage blocked: play it, it's short */
  }
  return true;
}

// Shows the name briefly, then the whole panel wipes upward.
// The page renders underneath the whole time, so the hero image is already
// painted by the time the curtain lifts.
export default function Preloader({ onDone }) {
  useEffect(() => {
    const timeout = window.setTimeout(onDone, 650);
    return () => window.clearTimeout(timeout);
  }, [onDone]);

  return (
    <motion.div
      className="preloader"
      aria-hidden="true"
      initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      transition={{ duration: 0.45, ease }}
    >
      <div className="preloader-name">
        <motion.span
          initial={{ y: '110%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-110%' }}
          transition={{ duration: 0.55, ease }}
        >
          Roel Hingabay
        </motion.span>
      </div>
      <motion.p
        className="preloader-role"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.2 }}
      >
        Digital Solutions Analyst
      </motion.p>
    </motion.div>
  );
}
