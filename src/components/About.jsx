import { motion } from 'framer-motion';
import { principles } from '../data/site';
import { reveal } from '../lib/motion';

export default function About({ goTo, reduceMotion }) {
  return (
    <section className="section shell" id="about" aria-labelledby="about-title">
      <motion.div {...reveal(reduceMotion)}>
        <h2 id="about-title">About me</h2>
      </motion.div>

      <div className="about-grid">
        <motion.div className="about-body" {...reveal(reduceMotion, 0.05)}>
          <p className="lede">
            A Digital Solutions Analyst with experience in developing web applications and automation solutions focused on performance, scalability, and usability. I specialize in building responsive frontend interfaces, developing reliable backend systems, identifying implementation gaps and potential risks, and designing system architectures that improve efficiency, reliability, and maintainability.
          </p>
          <p>
           As a self-driven developer, I take ownership of projects from analysis and planning to implementation and optimization. I leverage modern technologies, clean architecture, and automation to build scalable solutions, streamline workflows, mitigate technical risks, and deliver seamless user experiences.
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
              <li key={principle} className="chip">
                {principle}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
