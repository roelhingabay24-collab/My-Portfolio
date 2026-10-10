import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { certifications } from '../data/certifications';
import { reveal } from '../lib/motion';
import Lightbox from './Lightbox';

const issuerFilters = ['All', 'Microsoft', 'Google', 'IBM', 'Coursera'];
const matchesIssuer = (cert, issuer) => issuer === 'All' || cert.issuer.includes(issuer);

// Three desktop columns and two mobile columns; full certificate details remain
// available in the image viewer and on the issuer's verification page.
export default function Certifications({ reduceMotion }) {
  const [issuer, setIssuer] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);
  const filtered = certifications.filter((cert) => matchesIssuer(cert, issuer));
  const count = filtered.length;
  const next = useCallback(() => setOpenIndex((current) => (current + 1) % count), [count]);
  const prev = useCallback(() => setOpenIndex((current) => (current - 1 + count) % count), [count]);
  const open = filtered[openIndex];

  return (
    <section className="section shell" id="certifications" aria-labelledby="certifications-title">
      <motion.div className="section-head" {...reveal(reduceMotion)}>
        <div>
          <h2 id="certifications-title">
            Certifications{' '}
            <span
              className="cert-count"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`${count} certifications`}
            >
              {count}
            </span>
          </h2>
        </div>
      </motion.div>

      <div className="cert-filters" role="group" aria-label="Filter certifications by issuer">
        {issuerFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={issuer === filter ? 'is-active' : undefined}
            aria-pressed={issuer === filter}
            aria-controls="certification-results"
            onClick={() => {
              setIssuer(filter);
              setOpenIndex(null);
            }}
          >
            {filter}{' '}
            <span className="cert-filter-count" aria-hidden="true">
              {certifications.filter((cert) => matchesIssuer(cert, filter)).length}
            </span>
          </button>
        ))}
      </div>

      <ul className="cert-grid" id="certification-results">
        {filtered.map((cert, index) => (
          <motion.li className="cert-card" key={cert.id} {...reveal(reduceMotion, (index % 4) * 0.06)}>
            <div className="cert-preview">
              <button
                type="button"
                className="cert-open"
                data-cursor="View"
                aria-haspopup="dialog"
                aria-label={`Enlarge certificate: ${cert.title}`}
                onClick={() => setOpenIndex(index)}
              >
                <span className="cert-thumb">
                  <img src={cert.image} alt="" loading="lazy" decoding="async" />
                  {cert.featured && (
                    <span className="cert-badge" aria-hidden="true">
                      Featured
                    </span>
                  )}
                </span>
              </button>
            </div>
            <div className="cert-body">
              <p className="cert-issuer">
                <span className="cert-logos" aria-hidden="true">
                  {cert.logos?.map((logo) => (
                    <img key={logo} src={`/logos/certifications/${logo}.png`} alt="" loading="lazy" />
                  ))}
                </span>
                <span className="cert-issuer-name">
                  <strong>{cert.issuer.split(' via ')[0]}</strong>
                  {cert.issuer.includes(' via ') && <span>via {cert.issuer.split(' via ')[1]}</span>}
                </span>
              </p>
              <h3>{cert.title}</h3>
              <p className="cert-kind">{cert.kind}</p>
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
                  className="cert-btn cert-eye"
                  aria-haspopup="dialog"
                  aria-label={`View certificate: ${cert.title}`}
                  onClick={() => setOpenIndex(index)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="19"
                    height="19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Preview</span>
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
            documentUrl={open.pdf}
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
