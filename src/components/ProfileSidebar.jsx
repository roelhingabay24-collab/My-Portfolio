import { CONTACT, RESUME_URL, SOCIALS } from '../data/site';
import SocialIcon from './SocialIcon';
import DownloadIcon from './DownloadIcon';
import ProfileCard from './ProfileCard';

export default function ProfileSidebar() {
  return (
    <aside className="profile-sidebar" aria-label="Roel Hingabay profile">
      <ProfileCard className="profile-card-wrap--sidebar" />
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
