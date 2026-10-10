import { useState } from 'react';
import { skillGroups } from '../data/skills';

const labels = [
  'Data',
  'Automation',
  'Business',
  'Marketing',
  'Power Platform',
  'Development',
  'AI & security',
];
const INITIAL_COUNT = 12;

export default function Skills() {
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(false);
  const groups = skillGroups.map((group, index) => ({ ...group, category: labels[index] }));
  const rows = groups
    .filter((group) => category === 'All' || category === group.category)
    .flatMap((group) => group.skills.map((name) => ({ name, category: group.category })));
  const visible = expanded ? rows : rows.slice(0, INITIAL_COUNT);

  return (
    <section className="section shell" id="skills" aria-labelledby="skills-title">
      <div className="section-head">
        <h2 id="skills-title">Skills</h2>
      </div>
      <div className="skill-filters" role="group" aria-label="Filter skills by category">
        {[...labels, 'All'].map((label) => (
          <button
            key={label}
            type="button"
            aria-pressed={category === label}
            onClick={() => {
              setCategory(label);
              setExpanded(false);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <ul className="skill-rows" id="skill-results">
        {visible.map((skill) => (
          <li className="skill-row" key={`${skill.category}-${skill.name}`}>
            <span className="skill-row-name">{skill.name}</span>
            <span className="skill-row-category">{skill.category}</span>
            <span className="skill-row-rule" aria-hidden="true" />
          </li>
        ))}
      </ul>
      <p className="skill-result-count" role="status">
        {visible.length} of {rows.length} skills
      </p>
      {rows.length > INITIAL_COUNT && (
        <button
          type="button"
          className="skill-toggle"
          aria-expanded={expanded}
          aria-controls="skill-results"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Show fewer skills' : `View all ${rows.length} skills`}
        </button>
      )}
    </section>
  );
}
