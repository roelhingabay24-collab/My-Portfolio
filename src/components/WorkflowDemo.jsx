import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const STEPS = ['Submit', 'Review', 'Approve', 'Notify'];
const STEP_MS = 850;
// Beats the finished state holds (all steps done) before the loop restarts.
const HOLD_BEATS = 3;

// A request moving through an approval flow, one step at a time, like a
// Power Automate run. It plays only while on screen; reduced motion shows the
// completed flow without animating.
export default function WorkflowDemo({ reduceMotion }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.6 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduceMotion || !inView) return undefined;
    const timer = window.setInterval(() => {
      setTick((current) => (current + 1) % (STEPS.length + HOLD_BEATS));
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [inView, reduceMotion]);

  // Steps before `step` are done; `step` itself is in progress.
  const step = reduceMotion ? STEPS.length : Math.min(tick, STEPS.length);

  return (
    <div className="flow" ref={ref} aria-hidden="true">
      {STEPS.map((label, index) => (
        <div className="flow-segment" key={label}>
          {index > 0 && <span className={`flow-link ${index <= step ? 'is-filled' : ''}`} />}
          <span className={`flow-node ${index < step ? 'is-done' : ''} ${index === step ? 'is-active' : ''}`}>
            <span className="flow-dot">
              <svg viewBox="0 0 12 12" focusable="false">
                <path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="flow-label">{label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
