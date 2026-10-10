import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { timeline } from '../data/timeline';
import { reveal } from '../lib/motion';
import ScrambleText from './ScrambleText';

export default function Roadmap({ reduceMotion }) {
  const railRef = useRef(null);
  // The rail fills as the list scrolls through the middle of the viewport.
  const { scrollYProgress } = useScroll({ target: railRef, offset: ['start 70%', 'end 55%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [reached, setReached] = useState(reduceMotion ? timeline.length : 0);

  // Each milestone lights up once the line has drawn down to its node.
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const rail = railRef.current;
    if (reduceMotion || !rail) return;
    const drawn = progress * rail.offsetHeight;
    const nodes = rail.querySelectorAll('.timeline-node');
    let next = 0;
    nodes.forEach((node) => {
      if (node.parentElement.offsetTop + node.offsetTop + node.offsetHeight / 2 <= drawn) next += 1;
    });
    setReached((current) => (next === current ? current : next));
  });

  return (
    <section className="section shell" id="experience" aria-labelledby="experience-title">
      <motion.div className="section-head" {...reveal(reduceMotion)}>
        <div>
          <p className="eyebrow"><ScrambleText text="Professional experience" trigger="view" /></p>
          <h2 id="experience-title">From reporting to full-stack solutions.</h2>
        </div>
        <p className="lede">A progression from operational reporting into application development and automation.</p>
      </motion.div>

      <div className="timeline" ref={railRef}>
        <span className="timeline-rail" aria-hidden="true">
          <motion.span className="timeline-rail-fill" style={{ scaleY: reduceMotion ? 1 : fill }} />
        </span>
        {timeline.map((item, index) => (
          <motion.article
            className={`timeline-item ${index === timeline.length - 1 ? 'is-current' : ''} ${index < reached ? 'is-reached' : ''}`}
            key={`${item.year}-${item.label}`}
            {...reveal(reduceMotion, index * 0.05)}
          >
            <span className="timeline-node" aria-hidden="true" />
            <p className="timeline-year">
              {index === timeline.length - 1 && <span className="dot" aria-hidden="true" />}
              {item.year}
            </p>
            <div className="timeline-copy">
              {item.company && (
                <div className="timeline-company">
                  {item.logo ? (
                    <img className="timeline-logo" src={item.logo} alt="" width="40" height="40" loading="lazy" />
                  ) : (
                    <span className="timeline-logo is-initials" aria-hidden="true">{item.initials}</span>
                  )}
                  <span className="timeline-company-name">{item.company}</span>
                </div>
              )}
              <h3>{item.label}</h3>
              <p>{item.text}</p>
              <div className="timeline-tags">
                {item.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
