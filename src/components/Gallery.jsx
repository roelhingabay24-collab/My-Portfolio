import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gallery, GALLERY_PLACEHOLDERS } from '../data/gallery';
import { reveal } from '../lib/motion';
import Lightbox from './Lightbox';

// Same wipe-and-settle reveal as the project thumbnails.
const tileReveal = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 },
  shown: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
};
const tileTransition = {
  clipPath: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
  scale: { duration: 1, ease: [0.22, 1, 0.36, 1] },
};

// Wide slots in the placeholder layout, so the empty grid already reads as a bento.
const PLACEHOLDER_WIDE = new Set([0, 3]);

export default function Gallery({ reduceMotion }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const count = gallery.length;
  const staticLayout = reduceMotion;
  const next = useCallback(() => setOpenIndex((current) => (current + 1) % count), [count]);
  const prev = useCallback(() => setOpenIndex((current) => (current - 1 + count) % count), [count]);

  const frameMotion = (index) => ({
    initial: staticLayout ? false : 'hidden',
    whileInView: staticLayout ? undefined : 'shown',
    viewport: { once: true, amount: 0.3 },
    transition: { staggerChildren: 0, delay: (index % 3) * 0.08 },
  });

  const head = (
    <motion.div className="section-head" {...reveal(reduceMotion)}>
      <div>
        <h2 id="gallery-title">Behind the work</h2>
      </div>
      <p className="lede">Moments with the teams, colleagues, and leaders I work with.</p>
    </motion.div>
  );

  const lightbox = (
    <AnimatePresence>
      {openIndex !== null && (
        <Lightbox
          src={gallery[openIndex].src}
          alt={gallery[openIndex].alt}
          caption={gallery[openIndex].caption}
          variant="photo"
          index={openIndex}
          count={count}
          onPrev={prev}
          onNext={next}
          onClose={() => setOpenIndex(null)}
          reduceMotion={reduceMotion}
        />
      )}
    </AnimatePresence>
  );

  return (
    <section className="section shell" id="gallery" aria-labelledby="gallery-title">
      {head}

      <div className="gallery-grid">
        {count > 0
          ? gallery.slice(0, showAll ? count : 6).map((photo, index) => (
              <motion.figure
                className={[
                  'gallery-tile',
                  photo.featured && 'is-featured',
                  photo.tall && 'is-tall',
                  photo.wide && 'is-wide',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={photo.src}
                data-cursor="Open"
                {...frameMotion(index)}
              >
                <button
                  type="button"
                  className="gallery-open"
                  aria-haspopup="dialog"
                  aria-label={`Enlarge photo: ${photo.alt}`}
                  onClick={() => setOpenIndex(index)}
                >
                  <motion.span className="gallery-media" variants={tileReveal} transition={tileTransition}>
                    <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
                  </motion.span>
                </button>
                {photo.featured && (
                  <span className="gallery-badge" aria-hidden="true">
                    Highlight
                  </span>
                )}
                {photo.caption && <figcaption>{photo.caption}</figcaption>}
              </motion.figure>
            ))
          : Array.from({ length: GALLERY_PLACEHOLDERS }, (_, index) => (
              <motion.div
                className={`gallery-tile is-placeholder ${PLACEHOLDER_WIDE.has(index) ? 'is-wide' : ''}`}
                key={index}
                aria-hidden="true"
                {...frameMotion(index)}
              >
                <motion.span className="gallery-media" variants={tileReveal} transition={tileTransition}>
                  <span className="gallery-empty">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    Photo coming soon
                  </span>
                </motion.span>
              </motion.div>
            ))}
      </div>

      {count > 6 && (
        <button
          type="button"
          className="btn btn-ghost gallery-toggle"
          aria-expanded={showAll}
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? 'Show fewer photos' : `View all ${count} photos`}
        </button>
      )}

      {lightbox}
    </section>
  );
}
