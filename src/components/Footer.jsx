import { RESUME_URL, SOCIALS } from '../data/site';
import SocialIcon from './SocialIcon';

export default function Footer({ goTo, onOpenResume }) {
  return (
    <footer className="shell">
      <div className="site-footer">
        <span>© {new Date().getFullYear()} Roel Hingabay</span>
        <nav aria-label="Elsewhere">
          {RESUME_URL && (
            <a href={RESUME_URL} aria-haspopup="dialog" onClick={onOpenResume}>
              Resume
            </a>
          )}
          {SOCIALS.map((social) => (
            <a
              className="social-icon-link"
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Visit ${social.label} (opens in a new tab)`}
              title={social.label}
            >
              <SocialIcon label={social.label} />
            </a>
          ))}
        </nav>
        <a href="#home" onClick={(event) => goTo(event, '#home')}>
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
