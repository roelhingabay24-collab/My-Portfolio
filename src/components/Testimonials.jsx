import { motion } from 'framer-motion';
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
