import { useId } from 'react';
import { brandIcons } from '../brand-icons';

// Restore the tools from the previous portfolio's Marquee, in the same order.
const tools = [
  { label: 'React', icon: 'react' },
  { label: 'TypeScript', icon: 'typescript' },
  { label: 'Power Apps', microsoft: true },
  { label: 'Power Automate', microsoft: true },
  { label: 'Power BI', icon: 'powerbi' },
  { label: 'Supabase', icon: 'supabase' },
  { label: 'PostgreSQL', icon: 'postgresql' },
  { label: 'Node.js', icon: 'node' },
  { label: 'Python', icon: 'python' },
  { label: 'Docker', icon: 'docker' },
  { label: 'SharePoint', microsoft: true },
  { label: 'Tailwind', icon: 'tailwind' },
  { label: 'Vite', icon: 'vite' },
  { label: 'Git', icon: 'git' },
  { label: 'Claude', icon: 'claude' },
  { label: 'OpenAI', icon: 'openai' },
];

function ToolLogo({ tool }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  if (tool.microsoft) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="#f25022" d="M1 1h10v10H1z" />
        <path fill="#7fba00" d="M13 1h10v10H13z" />
        <path fill="#00a4ef" d="M1 13h10v10H1z" />
        <path fill="#ffb900" d="M13 13h10v10H13z" />
      </svg>
    );
  }
  const icon = brandIcons[tool.icon];
  // The duplicated carousel lists need separate IDs for the bundled SVG gradients.
  const body = icon.body?.replaceAll('SVG', `${id}-SVG`);
  return (
    <svg viewBox={icon.viewBox} aria-hidden="true" focusable="false">
      {icon.path ? (
        <path d={icon.path} fill="currentColor" />
      ) : (
        <g dangerouslySetInnerHTML={{ __html: body }} />
      )}
    </svg>
  );
}

function ToolList({ items, duplicate = false }) {
  return (
    <ul className="stack-tool-list" aria-hidden={duplicate || undefined}>
      {items.map((tool) => (
        <li key={tool.label}>
          <ToolLogo tool={tool} />
          <span>{tool.label}</span>
        </li>
      ))}
    </ul>
  );
}

export default function StackTools({ reduceMotion }) {
  return (
    <section
      className={`section shell stack-tools${reduceMotion ? ' is-static' : ''}`}
      id="stack-tools"
      aria-labelledby="stack-tools-title"
    >
      <div className="stack-tools-head">
        <h2 id="stack-tools-title">Stack and tools</h2>
      </div>
      <div
        className="stack-tool-cloud"
        id="stack-tool-cloud"
        tabIndex={reduceMotion ? undefined : 0}
        role="group"
        aria-label="Technology logos"
      >
        {[tools.slice(0, 8), tools.slice(8)].map((items, index) => (
          <div className={`stack-tool-lane${index === 1 ? ' is-reversed' : ''}`} key={index}>
            <div className="stack-tool-track">
              <ToolList items={items} />
              {!reduceMotion && <ToolList items={items} duplicate />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
