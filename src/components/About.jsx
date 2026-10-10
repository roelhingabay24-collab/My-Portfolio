import { motion } from 'framer-motion';
import { principles } from '../data/site';
import { reveal } from '../lib/motion';
import ScrambleText from './ScrambleText';

export default function About({ goTo, reduceMotion }) {
  return (
    <section className="section shell" id="about" aria-labelledby="about-title">
      <motion.div {...reveal(reduceMotion)}>
        <p className="eyebrow"><ScrambleText text="About" trigger="view" /></p>
        <h2 id="about-title">Technology that works for the people who use it.</h2>
      </motion.div>

      <div className="about-grid">
        <motion.div className="about-body" {...reveal(reduceMotion, 0.05)}>
          <p className="lede">
            Every system I build should be clear enough to trust and reliable enough to last.
          </p>
          <p>
            I&rsquo;m Roel Hingabay, a Digital Solutions Analyst focused on building practical, scalable systems
            that improve the way people work.
          </p>
          <p>
            My work combines low-code platforms, full-stack development, automation, cloud technologies, and
            AI-assisted delivery to turn complex, manual processes into effective digital products.
          </p>
          <a className="text-link" href="#contact" onClick={(event) => goTo(event, '#contact')}>
            Start a conversation <span aria-hidden="true">↗</span>
          </a>
          <ul className="principles">
            {principles.map((principle) => (
              <li key={principle} className="chip">{principle}</li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
}
