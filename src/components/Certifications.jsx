import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { certifications } from '../data/certifications';
import { reveal } from '../lib/motion';
import Lightbox from './Lightbox';
import ScrambleText from './ScrambleText';

// Compact cards in an auto-filling grid, so adding a certificate is just a data
// entry: the grid reflows from four across down to two on phones. The full
// details (credential ID, instructor, length) live on the certificate image and
// the issuer's verification page.
export default function Certifications({ reduceMotion }) {
  const [openIndex, setOpenIndex] = useState(null);
  const count = certifications.length;
  const next = useCallback(() => setOpenIndex((current) => (current + 1) % count), [count]);
  const prev = useCallback(() => setOpenIndex((current) => (current - 1 + count) % count), [count]);
  const open = certifications[openIndex];

  return (
    <section className="section shell" id="certifications" aria-labelledby="certifications-title">
      <motion.div className="section-head" {...reveal(reduceMotion)}>
        <div>
          <p className="eyebrow"><ScrambleText text="Certifications" trigger="view" /></p>
          <h2 id="certifications-title">Continuous learning, verified.</h2>
        </div>
        <p className="lede">Completed coursework in AI, business analytics, databases, and security.</p>
      </motion.div>

      <ul className="cert-grid">
        {certifications.map((cert, index) => (
          <motion.li className="cert-card" key={cert.id} {...reveal(reduceMotion, (index % 4) * 0.06)}>
            <button
              type="button"
              className="cert-open"
              data-cursor="View"
              /* Mouse shortcut only; the "View certificate" button is the accessible control. */
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => setOpenIndex(index)}
            >
              <span className="cert-thumb">
                <img src={cert.image} alt="" loading="lazy" decoding="async" />
                {cert.featured && <span className="cert-badge" aria-hidden="true">Featured</span>}
              </span>
            </button>
            <div className="cert-body">
              <p className="cert-issuer">
                <span className="cert-issuer-name">{cert.issuer}</span>
                <span aria-hidden="true">·</span>
                <span>{cert.issued}</span>
              </p>
              <h3>{cert.title}</h3>
              <div className="cert-actions">
                {cert.verifyUrl && (
                  <a
                    className="cert-btn is-primary"
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View credential for ${cert.title} (opens in a new tab)`}
                  >
                    View credential <span aria-hidden="true">↗</span>
                  </a>
                )}
                <button
                  type="button"
                  className={`cert-btn ${cert.verifyUrl ? '' : 'is-primary'}`}
                  aria-haspopup="dialog"
                  aria-label={`View certificate: ${cert.title}`}
                  onClick={() => setOpenIndex(index)}
                >
                  View certificate
                </button>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {open && (
          <Lightbox
            src={open.image}
            pdf={open.pdf}
            alt={`${open.kind} for ${open.title}, issued by ${open.issuer} on ${open.issued}`}
            caption={open.title}
            index={openIndex}
            count={count}
            onPrev={prev}
            onNext={next}
            onClose={() => setOpenIndex(null)}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
