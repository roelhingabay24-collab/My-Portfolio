import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { brandIcons } from '../brand-icons';

const tools = [
  { label: 'React', icon: 'react' },
  { label: 'TypeScript', icon: 'typescript' },
  { label: 'Power Apps' },
  { label: 'Power Automate' },
  { label: 'Power BI', icon: 'powerbi' },
  { label: 'Supabase', icon: 'supabase' },
  { label: 'PostgreSQL', icon: 'postgresql' },
  { label: 'Node.js', icon: 'node' },
  { label: 'Python', icon: 'python' },
  { label: 'Docker', icon: 'docker' },
  { label: 'SharePoint' },
  { label: 'Tailwind', icon: 'tailwind' },
  { label: 'Vite', icon: 'vite' },
  { label: 'Git', icon: 'git' },
  { label: 'Claude', icon: 'claude' },
  { label: 'OpenAI', icon: 'openai' },
];

// Percent of the track (one full copy = 50%) moved per second at rest.
const BASE_SPEED = 2.4;

const wrap = (min, max, value) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

function ToolIcon({ name }) {
  const icon = brandIcons[name];
  if (!icon) return <span className="marquee-glyph" aria-hidden="true" />;
  return (
    <svg viewBox={icon.viewBox} aria-hidden="true" focusable="false">
      {icon.path
        ? <path d={icon.path} fill="currentColor" />
        // Upstream full-colour art bundled with the site, not user content.
        : <g dangerouslySetInnerHTML={{ __html: icon.body }} />}
    </svg>
  );
}

function ToolList({ hidden }) {
  return (
    <ul className="marquee-list" aria-hidden={hidden || undefined}>
      {tools.map((tool) => (
        <li key={tool.label}>
          <ToolIcon name={tool.icon} />
          {tool.label}
        </li>
      ))}
    </ul>
  );
}

// Endless strip of tools. Scrolling speeds it up and flips its direction with
// the scroll direction; hovering pauses it. Reduced motion shows a still row.
export default function Marquee({ reduceMotion }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const paused = useRef(false);
  const direction = useRef(-1);

  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-2000, 0, 2000], [-5, 0, 5], { clamp: false });
  const translate = useTransform(x, (value) => `${value}%`);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || !inView || paused.current) return;
    const factor = boost.get();
    if (factor < 0) direction.current = 1;
    else if (factor > 0) direction.current = -1;
    let moveBy = direction.current * BASE_SPEED * (delta / 1000);
    moveBy += moveBy * Math.abs(factor);
    x.set(wrap(-50, 0, x.get() + moveBy));
  });

  return (
    <section
      className="marquee"
      aria-label="Tools I work with"
      ref={ref}
      onPointerEnter={() => { paused.current = true; }}
      onPointerLeave={() => { paused.current = false; }}
    >
      <motion.div className="marquee-track" style={reduceMotion ? undefined : { x: translate }}>
        <ToolList />
        <ToolList hidden />
      </motion.div>
    </section>
  );
}
