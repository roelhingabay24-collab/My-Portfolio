import { motion } from 'framer-motion';
import { projects } from '../data/projects';
import { morph, projectMediaId, reveal, trackSpotlight } from '../lib/motion';
import ScrambleText from './ScrambleText';

// Wipes open from the bottom while settling from a slight zoom.
const thumbReveal = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 },
  shown: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
};

export default function Work({ onOpenProject, onPrepareProject, reduceMotion }) {
  return (
    <section className="section shell" id="projects" aria-labelledby="work-title">
      <motion.div className="section-head" {...reveal(reduceMotion)}>
        <div>
          <p className="eyebrow"><ScrambleText text="Projects" trigger="view" /></p>
          <h2 id="work-title">Selected projects and systems.</h2>
        </div>
        <p className="lede">
          {projects.length} projects spanning internal systems, workflow automation, and product concepts.
        </p>
      </motion.div>

      <div className="work-grid">
        {projects.map((project, index) => (
          <motion.article
            className={`work-card ${project.featured ? 'is-featured' : ''}`}
            key={project.number}
            data-cursor="View"
            onPointerMove={reduceMotion ? undefined : trackSpotlight}
            /* Staggered by column, so each row resolves left-to-right. */
            {...reveal(reduceMotion, (index % 2) * 0.09)}
          >
            {/* The unclipped frame is what gets observed; a zero-area clip never reads as in view. */}
            <motion.div
              className="work-thumb"
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'shown'}
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div
                className="work-thumb-media"
                variants={thumbReveal}
                layoutId={reduceMotion ? undefined : projectMediaId(project.number)}
                transition={{
                  ...morph,
                  clipPath: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
                  scale: { duration: 1, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                {project.gallery[0] ? (
                  <motion.img
                    layout={reduceMotion ? undefined : true}
                    src={project.gallery[0]}
                    alt={`${project.title} interface preview`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="work-empty">Preview coming soon</span>
                )}
              </motion.div>
              <span className="work-status">{project.status}</span>
            </motion.div>
            <div className="work-body">
              <div className="work-title">
                <h3>{project.title}</h3>
                <span>{project.year}</span>
              </div>
              <p>{project.description}</p>
              <p className="work-result"><span>Outcome</span>{project.highlight}</p>
              <div className="work-tags">
                {project.tags.map((tag) => <span className="chip" key={tag}>{tag}</span>)}
              </div>
              {/* Covers the whole card so the entire surface is clickable, while staying a real button. */}
              <button
                type="button"
                className="work-more"
                aria-haspopup="dialog"
                aria-label={`View the ${project.title} project`}
                onPointerEnter={onPrepareProject}
                onFocus={onPrepareProject}
                onClick={() => onOpenProject(index)}
              >
                View project <span aria-hidden="true">→</span>
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
