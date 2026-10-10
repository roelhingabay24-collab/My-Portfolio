import { motion } from 'framer-motion';
import { reveal } from '../lib/motion';
import ScrambleText from './ScrambleText';
import WorkflowDemo from './WorkflowDemo';

const capabilities = [
  {
    number: '01',
    title: 'Reporting and decision support',
    text: 'Dashboards, maps, and internal tools that surface key information and support faster, better-informed decisions.',
  },
  {
    number: '02',
    title: 'Process automation',
    text: 'Automated workflows that reduce manual handoffs while keeping ownership, approvals, and history traceable.',
    demo: true,
  },
  {
    number: '03',
    title: 'End-to-end delivery',
    text: 'From requirements and data modeling to testing, deployment, and continuous improvement.',
  },
];

export default function Capabilities({ reduceMotion }) {
  return (
    <section className="capabilities shell" aria-labelledby="capabilities-title">
      <motion.div className="capabilities-intro" {...reveal(reduceMotion)}>
        <p className="eyebrow"><ScrambleText text="Core capabilities" trigger="view" /></p>
        <h2 id="capabilities-title">Practical solutions for real operations.</h2>
      </motion.div>

      <div className="capability-grid">
        {capabilities.map((capability, index) => (
          <motion.article
            className="capability-card"
            key={capability.number}
            {...reveal(reduceMotion, index * 0.07)}
          >
            <span className="capability-number">{capability.number}</span>
            <h3>{capability.title}</h3>
            <p>{capability.text}</p>
            {capability.demo && <WorkflowDemo reduceMotion={reduceMotion} />}
          </motion.article>
        ))}
      </div>
    </section>
  );
}
