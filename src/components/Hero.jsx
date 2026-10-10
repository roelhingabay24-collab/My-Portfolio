import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { brandIcons } from '../brand-icons';
import { AVAILABILITY, RESUME_URL, SOCIALS } from '../data/site';
import { projects } from '../data/projects';
import { magnetic, resetTilt, trackTilt } from '../lib/motion';

// WebGL background, fetched only after the intro so it never competes with first paint.
const HeroShader = lazy(() => import('./HeroShader'));

const ease = [0.22, 1, 0.36, 1];
const titleVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
// Each line rises out from behind its own mask.
const lineVariants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.95, ease } },
};

const heroStats = [
  { label: 'Focus', value: 'Digital Solutions Analyst' },
  { label: 'Open to', value: AVAILABILITY.openTo },
  { label: 'Portfolio', count: projects.length, suffix: 'projects & systems' },
];

const socialPaths = {
  LinkedIn: 'M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V21h-4V8zm6.5 0h3.83v1.78h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-6.32c0-1.51-.03-3.45-2.1-3.45-2.1 0-2.42 1.64-2.42 3.34V21H7V8z',
  Instagram: 'M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z',
};

function SocialIcon({ label }) {
  const path = label === 'GitHub' ? brandIcons.github.path : socialPaths[label];
  return (
    <svg viewBox="0 0 24 24" role="presentation" focusable="false" aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
  );
}

// Counts up once, the first time it scrolls into view.
function CountUp({ to, suffix }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (reduceMotion || !inView) return undefined;
    const controls = animate(0, to, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (current) => setAnimated(Math.round(current)),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, to]);

  // Reduced motion renders the final value straight away rather than counting.
  const value = reduceMotion ? to : animated;

  return <b ref={ref}>{value} {suffix}</b>;
}

export default function Hero({ goTo, reduceMotion, ready = true, onOpenResume }) {
  const [showShader, setShowShader] = useState(false);

  useEffect(() => {
    if (!ready) return undefined;
    const idle = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 400));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const handle = idle(() => setShowShader(true));
    return () => cancel(handle);
  }, [ready]);

  const settle = (delay) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    animate: reduceMotion ? {} : ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.7, delay, ease },
  });

  return (
    <section className="hero shell" id="home">
      {showShader && (
        <Suspense fallback={null}>
          <HeroShader reduceMotion={reduceMotion} />
        </Suspense>
      )}
      <div className="hero-copy">
        <motion.h1
          className="hero-title"
          variants={titleVariants}
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion || ready ? 'show' : 'hidden'}
        >
          <span className="hero-line"><motion.span variants={lineVariants}>Practical</motion.span></span>{' '}
          <span className="hero-line hero-line-offset">
            <motion.span className="hero-shine" variants={lineVariants}>systems</motion.span>
          </span>{' '}
          <span className="hero-line hero-line-sub"><motion.em variants={lineVariants}>for better work.</motion.em></span>
        </motion.h1>
        <motion.div {...settle(0.35)}>
          <p className="lede">
            I&rsquo;m Roel Hingabay, a Digital Solutions Analyst building web applications, Power Platform solutions,
            and reporting tools that help operations teams work more efficiently. Open to {AVAILABILITY.roles},
            {' '}{AVAILABILITY.arrangement.toLowerCase()}.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" {...magnetic(reduceMotion)} href="#projects" onClick={(event) => goTo(event, '#projects')}>
              View projects <span aria-hidden="true">→</span>
            </a>
            <a className="btn btn-ghost" {...magnetic(reduceMotion)} href="#contact" onClick={(event) => goTo(event, '#contact')}>
              Get in touch
            </a>
            {RESUME_URL && (
              <a
                className="btn btn-ghost"
                {...magnetic(reduceMotion)}
                href={RESUME_URL}
                aria-haspopup="dialog"
                onClick={onOpenResume}
              >
                View resume <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
          <dl className="hero-meta">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>
                  {stat.count === undefined
                    ? <b>{stat.value}</b>
                    : <CountUp to={stat.count} suffix={stat.suffix} />}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>

      <motion.aside
        className="hero-profile"
        {...settle(0.2)}
        aria-label="About Roel Hingabay"
      >
        <div
          className="hero-profile-card"
          onPointerMove={reduceMotion ? undefined : trackTilt}
          onPointerLeave={reduceMotion ? undefined : resetTilt}
        >
          <figure className="hero-profile-image">
            <img
              src="/images/profile.webp"
              alt="Roel Hingabay in Taguig City"
              width="720"
              height="900"
              fetchPriority="high"
            />
            <span className="hero-profile-status"><span className="dot" aria-hidden="true" /> Available for new work</span>
          </figure>
          <div className="hero-profile-body">
            <div>
              <p className="hero-profile-kicker">Digital Solutions Analyst</p>
              <h2>Roel Hingabay</h2>
            </div>
            <p>Building practical applications, automations, and AI-assisted workflows.</p>
          </div>
          <nav className="hero-socials" aria-label="Social profiles">
            {SOCIALS.map((social) => (
              <a
                className="hero-social-link"
                {...magnetic(reduceMotion, 0.45)}
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit ${social.label}`}
                title={social.label}
              >
                <SocialIcon label={social.label} />
              </a>
            ))}
          </nav>
        </div>
      </motion.aside>
    </section>
  );
}
