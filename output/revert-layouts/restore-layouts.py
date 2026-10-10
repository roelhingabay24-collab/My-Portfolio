from pathlib import Path

root = Path('D:/Portfolio')

skills = """import { useId, useState } from 'react';
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
"""

testimonials = r"""import { motion } from 'framer-motion';
import { testimonials } from '../data/testimonials';
import { reveal } from '../lib/motion';
import ScrambleText from './ScrambleText';

const initials = (name) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

// Copies of the card set in the strip. Each copy slides left by its own width,
// so enough copies must exist to cover a wide screen while one scrolls away.
const COPIES = 4;

function QuoteCard({ item }) {
  // Without a name, the role stands in as the heading line.
  const heading = item.name || item.role;
  return (
    <figure className={`quote-card ${item.sample ? 'is-sample' : ''}`}>
      <figcaption>
        {item.logo ? (
          <img className="quote-avatar" src={item.logo} alt="" width="48" height="48" loading="lazy" />
        ) : (
          <span className="quote-avatar is-initials" aria-hidden="true">{initials(heading)}</span>
        )}
        <span className="quote-person">
          <span className="quote-name">{heading}</span>
          <span className="quote-role">{item.name ? item.role : item.company}</span>
          {item.name && <span className="quote-company">{item.company}</span>}
          {item.previously && <span className="quote-previously">{item.previously}</span>}
        </span>
      </figcaption>
      <blockquote>
        <p>{item.quote}</p>
      </blockquote>
      {item.sample && <span className="quote-tag">Sample</span>}
      {!item.sample && item.about && <span className="quote-tag">On {item.about}</span>}
    </figure>
  );
}

// Endless strip of recommendations, faded at both edges; hovering or focusing
// it pauses the scroll. Reduced motion shows one still, wrapping set instead.
export default function Testimonials({ reduceMotion }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="section quotes" id="recommendations" aria-labelledby="recommendations-title">
      <motion.div className="shell quotes-head" {...reveal(reduceMotion)}>
        <p className="eyebrow"><ScrambleText text="Recommendations" trigger="view" /></p>
        <h2 id="recommendations-title">What colleagues say.</h2>
        <p className="lede">From the leaders and stakeholders I have built systems for.</p>
      </motion.div>

      <motion.div className="quote-marquee" {...reveal(reduceMotion, 0.1)}>
        {Array.from({ length: reduceMotion ? 1 : COPIES }, (_, copy) => (
          <div className="quote-group" key={copy} aria-hidden={copy > 0 || undefined}>
            {testimonials.map((item, index) => (
              <QuoteCard item={item} key={`${item.name || item.role}-${index}`} />
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
"""

skills_css = """/* Plain titled groups of soft pills, two across on wide screens. */
.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
  gap: 40px 56px;
  margin-top: 36px;
}
.skill-group h3 { font-size: 18px; }
.skill-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0; padding: 0; list-style: none; }
.skill-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 11px;
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}
.skill-toggle {
  margin-top: 14px;
  padding: 2px 0;
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.skill-toggle:hover { text-decoration: underline; text-underline-offset: 4px; }

"""

quotes_css = """.quotes-head { display: grid; justify-items: center; gap: 0; text-align: center; }
.quotes-head .lede { max-width: 46ch; margin-top: 14px; }
.quote-marquee {
  --gap: 16px;
  --duration: 40s;
  display: flex;
  gap: var(--gap);
  margin-top: 48px;
  padding-block: 8px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
}
.quote-group {
  display: flex;
  flex: none;
  gap: var(--gap);
  animation: quote-scroll var(--duration) linear infinite;
}
.quote-marquee:hover .quote-group,
.quote-marquee:focus-within .quote-group { animation-play-state: paused; }
@keyframes quote-scroll {
  to { transform: translateX(calc(-100% - var(--gap))); }
}
.quote-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 320px;
  margin: 0;
  padding: 24px;
  border: 1px solid var(--line);
  border-top-color: var(--line-strong);
  border-radius: var(--r-lg);
  background: linear-gradient(180deg, var(--surface-2), color-mix(in srgb, var(--surface-2) 25%, transparent));
  transition: background .25s ease, border-color .25s ease;
}
.quote-card:hover {
  border-color: var(--line-strong);
  background: linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 100%, var(--text) 4%), color-mix(in srgb, var(--surface-2) 50%, transparent));
}
.quote-card.is-sample { border-style: dashed; }
.quote-card figcaption { display: flex; align-items: center; gap: 12px; }
.quote-avatar {
  flex: none;
  width: 48px;
  height: 48px;
  padding: 5px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: #fff;
  object-fit: contain;
}
.quote-avatar.is-initials {
  display: grid;
  place-items: center;
  padding: 0;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--mono);
  font-size: 14px;
  font-weight: 500;
}
.quote-person { display: grid; gap: 2px; min-width: 0; text-align: start; }
.quote-name { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.quote-role { color: var(--muted); font-size: 13px; line-height: 1.35; }
.quote-company { color: var(--faint); font-size: 12px; }
/* A notable earlier role, set apart from the current title by a hairline. */
.quote-previously {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--line);
  color: var(--faint);
  font-size: 12px;
  line-height: 1.35;
}
.quote-card blockquote { flex: 1; margin: 0; }
.quote-card blockquote p { color: var(--muted); font-size: 15px; line-height: 1.6; }
.quote-card.is-sample blockquote p { font-style: italic; }
.quote-tag {
  align-self: flex-start;
  padding: 3px 9px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  color: var(--faint);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: .06em;
  text-transform: uppercase;
}
@media (prefers-reduced-motion: reduce) {
  .quote-marquee { flex-wrap: wrap; justify-content: center; padding-inline: 16px; -webkit-mask-image: none; mask-image: none; }
  .quote-group { flex-wrap: wrap; justify-content: center; animation: none; }
}

"""

css_path = root / 'src/styles.css'
css = css_path.read_bytes().decode('utf-8')
start = css.index('/* Orbital category explorer,')
end = css.index('/* ── Certifications', start)
css = css[:start] + skills_css + css[end:]
start = css.index('.quotes-head {')
end = css.index('/* ── Resume viewer', start)
css = css[:start] + quotes_css + css[end:]
for relative, content in [('src/components/Skills.jsx', skills), ('src/components/Testimonials.jsx', testimonials), ('src/styles.css', css)]:
    (root / relative).write_bytes(content.encode('utf-8'))
print('Restored both original components and their styles. Certificate and skill data untouched.')
