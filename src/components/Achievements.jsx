import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { achievements } from '../data/achievements';
import { RESUME_URL } from '../data/site';
import { reveal } from '../lib/motion';
import ScrambleText from './ScrambleText';

export default function Achievements({ reduceMotion }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const activeAchievement = achievements[activeIndex];

  const showAchievement = (index, nextDirection = Math.sign(index - activeIndex)) => {
    setDirection(nextDirection || 1);
    setActiveIndex((index + achievements.length) % achievements.length);
  };

  return (
    <section className="section shell" id="milestones" aria-labelledby="milestones-title">
      <motion.div className="section-head" {...reveal(reduceMotion)}>
        <div>
          <p className="eyebrow"><ScrambleText text="Milestones" trigger="view" /></p>
          <h2 id="milestones-title">Milestones that shaped my work.</h2>
        </div>
        <p className="lede">Key steps, from clarifying operational data to building tools that improve everyday work.</p>
      </motion.div>

      <div className="achievement-carousel" role="region" aria-roledescription="carousel" aria-labelledby="milestones-title">
        <div className="achievement-artwork">
          <AnimatePresence mode="wait" initial={false}>
            {activeAchievement.image ? (
              <motion.img
                key={activeAchievement.number}
                src={activeAchievement.image}
                alt={`${activeAchievement.title} supporting image`}
                initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : (
              <motion.div
                key={activeAchievement.number}
                className="achievement-artwork-placeholder"
                aria-hidden="true"
                initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <span>{activeAchievement.category}</span>
                <strong>{activeAchievement.number}</strong>
              </motion.div>
            )}
          </AnimatePresence>
          <span className="achievement-artwork-caption">{activeAchievement.category}</span>
        </div>

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.article
            className="achievement-slide"
            key={activeAchievement.number}
            custom={direction}
            initial={reduceMotion ? false : 'enter'}
            animate="center"
            exit={reduceMotion ? { opacity: 0 } : 'exit'}
            variants={{
              enter: (travel) => ({ opacity: 0, x: travel * 30, filter: 'blur(6px)' }),
              center: { opacity: 1, x: 0, filter: 'blur(0px)' },
              exit: (travel) => ({ opacity: 0, x: travel * -24, filter: 'blur(4px)' }),
            }}
            transition={{ duration: reduceMotion ? 0.12 : 0.42, ease: [0.22, 1, 0.36, 1] }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${activeIndex + 1} of ${achievements.length}`}
            aria-live="polite"
          >
          <span className="achievement-number">{activeAchievement.number} / {String(achievements.length).padStart(2, '0')}</span>
          <div>
            <p className="achievement-category">{activeAchievement.context} · {activeAchievement.period}</p>
            <h3>{activeAchievement.title}</h3>
            <p className="achievement-summary">{activeAchievement.summary}</p>
          </div>

          <div className="achievement-slide-footer">
            {activeAchievement.credentialUrl ? (
              <a className="text-link" href={activeAchievement.credentialUrl} target="_blank" rel="noreferrer">
                View credential <span aria-hidden="true">↗</span>
              </a>
            ) : null}

            <div className="achievement-controls" role="group" aria-label="Milestone carousel controls">
              <button type="button" className="icon-btn" onClick={() => showAchievement(activeIndex - 1, -1)} aria-label="Previous milestone">
                <span aria-hidden="true">←</span>
              </button>
              <button type="button" className="icon-btn" onClick={() => showAchievement(activeIndex + 1, 1)} aria-label="Next milestone">
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <div className="achievement-dots" role="group" aria-label="Choose a milestone">
            {achievements.map((achievement, index) => (
              <button
                key={achievement.number}
                type="button"
                className={index === activeIndex ? 'is-active' : ''}
                aria-label={`Show slide ${index + 1}: ${achievement.title}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => showAchievement(index)}
              />
            ))}
          </div>
          </motion.article>
        </AnimatePresence>
      </div>

      {RESUME_URL && (
        <a className="achievement-resume btn btn-ghost" href={RESUME_URL} target="_blank" rel="noreferrer">
          View resume PDF <span aria-hidden="true">↗</span>
        </a>
      )}
    </section>
  );
}
