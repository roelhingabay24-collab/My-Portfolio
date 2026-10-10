import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { skillGroups } from '../data/skills';
import { reveal } from '../lib/motion';
import ScrambleText from './ScrambleText';

// How many tags a group shows before "View all skills".
const INITIAL_COUNT = 8;

const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const tagVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

// One titled group: the first tags rise in one after another when scrolled
// into view; the rest pop in behind a "View all skills" toggle.
function SkillGroup({ group, reduceMotion }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const shown = group.skills.slice(0, INITIAL_COUNT);
  const extra = group.skills.slice(INITIAL_COUNT);

  return (
    <div className="skill-group">
      <h3>{group.title}</h3>
      <motion.ul
        className="skill-list"
        id={listId}
        variants={listVariants}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {shown.map((skill) => (
          <motion.li className="skill-tag" key={skill} variants={tagVariants}>{skill}</motion.li>
        ))}
        <AnimatePresence>
          {expanded && extra.map((skill) => (
            <motion.li
              className="skill-tag"
              key={skill}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {skill}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {extra.length > 0 && (
        <button
          type="button"
          className="skill-toggle"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'View less skills' : `View all skills (${group.skills.length})`}
        </button>
      )}
    </div>
  );
}

export default function Skills({ reduceMotion }) {
  return (
    <section className="section shell" id="skills" aria-labelledby="skills-title">
      <motion.div className="section-head" {...reveal(reduceMotion)}>
        <div>
          <p className="eyebrow"><ScrambleText text="Skills" trigger="view" /></p>
          <h2 id="skills-title">Tools I use, backed by work and study.</h2>
        </div>
        <p className="lede">Skills developed through day-to-day work, certifications, and ongoing learning.</p>
      </motion.div>

      <div className="skill-grid">
        {skillGroups.map((group) => (
          <SkillGroup group={group} key={group.title} reduceMotion={reduceMotion} />
        ))}
      </div>
    </section>
  );
}
