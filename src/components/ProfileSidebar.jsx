import { AVAILABILITY, CONTACT, RESUME_URL, SOCIALS } from '../data/site';
import SocialIcon from './SocialIcon';
import DownloadIcon from './DownloadIcon';

export default function ProfileSidebar() {
  return (
    <aside className="profile-sidebar" aria-label="Roel Hingabay profile">
      <div className="sidebar-identity">
        <img
          className="sidebar-avatar"
          src="/images/profile.webp"
          alt="Roel Hingabay"
          width="80"
          height="80"
          fetchPriority="high"
        />
        <p className="sidebar-name">Roel Hingabay</p>
        <p className="sidebar-role">Digital Solutions Analyst</p>
        <p className="sidebar-summary">
          Turning business needs into clear, reliable digital solutions through practical applications,
          process automation, and actionable reporting.
        </p>
        <ul className="sidebar-facts">
          <li>
            <svg
              className="sidebar-fact-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {AVAILABILITY.location}
          </li>
          <li>
            <span aria-hidden="true">↗</span>
            {AVAILABILITY.arrangement}
          </li>
          <li>
            <svg
              className="sidebar-fact-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <ellipse cx="12" cy="12" rx="4" ry="9" />
              <path d="M3 12h18M5 6h14M5 18h14" />
            </svg>
            <div className="sidebar-project-counts">
              <span>4 Projects</span>
              <span>3 Personal Projects</span>
            </div>
          </li>
        </ul>
      </div>
      <div className="sidebar-bottom">
        <nav className="sidebar-socials" aria-label="Social profiles">
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
        <div className="sidebar-actions">
          <a className="btn btn-primary" href={RESUME_URL} download="Roel-Hingabay-Resume.pdf">
            <DownloadIcon />
            Download CV
          </a>
          <a className="sidebar-email" href={`mailto:${CONTACT.email}`} aria-label={`Email ${CONTACT.email}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 6 9 7 9-7" />
            </svg>
          </a>
        </div>
      </div>
    </aside>
  );
}
