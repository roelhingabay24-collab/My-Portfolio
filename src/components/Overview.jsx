import { AVAILABILITY, RESUME_URL, SOCIALS } from '../data/site';
import { timeline } from '../data/timeline';
import SocialIcon from './SocialIcon';
import DownloadIcon from './DownloadIcon';

export default function Overview({ goTo }) {
  return (
    <section className="portfolio-overview shell" id="home" aria-labelledby="overview-title">
      <div className="overview-mobile-profile">
        <img src="/images/profile.webp" alt="Roel Hingabay" width="64" height="64" />
        <div>
          <p>Roel Hingabay</p>
          <span>{AVAILABILITY.location}</span>
        </div>
      </div>
      <svg
        className="overview-illustration"
        viewBox="0 0 180 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="45" y="28" width="90" height="58" rx="6" />
        <path d="M37 92h106l-8 10H45zM63 59l-8 6 8 6m54-12 8 6-8 6m-22-18-10 24" />
        <circle cx="90" cy="10" r="4" />
        <circle cx="155" cy="59" r="4" />
        <path d="M22 47h12m-6-6v12M145 19h10m-5-5v10M90 14v8M139 59h12" />
      </svg>
      <h1 id="overview-title">Digital Solutions Analyst</h1>
      <p className="overview-description">
        Building scalable web applications through clean architecture, automated documentation, and modern
        technologies, while delivering intuitive user experiences that maximize productivity and minimize
        workflow delays.
      </p>
      <p className="overview-availability">
        Open to {AVAILABILITY.openTo.toLowerCase()} · {AVAILABILITY.arrangement}
      </p>
      <div className="overview-actions">
        <a
          className="btn overview-experience"
          href="#experience"
          onClick={(event) => goTo(event, '#experience')}
        >
          <span className="experience-logo-row" aria-hidden="true">
            {timeline
              .filter((item) => item.logo)
              .map((item) => (
                <img key={item.company} src={item.logo} alt="" title={item.company} width="28" height="28" />
              ))}
          </span>
          <span>View Experience</span>
          <span className="experience-arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
      <nav className="overview-mobile-socials" aria-label="Mobile social profiles">
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
        <a className="mobile-cv-link" href={RESUME_URL} download="Roel-Hingabay-Resume.pdf">
          <DownloadIcon />
          Download CV
        </a>
      </nav>
    </section>
  );
}
