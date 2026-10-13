import { useId } from 'react';
import { AVAILABILITY, SOCIALS } from '../data/site';
import SocialIcon from './SocialIcon';

const VERIFIED_BADGE_PATH =
  'M12 0 14.6 2.1 18 1.6 19.2 4.8 22.4 6 21.8 9.4 24 12 21.8 14.6 22.4 18 19.2 19.2 18 22.4 14.6 21.8 12 24 9.4 21.8 6 22.4 4.8 19.2 1.6 18 2.1 14.6 0 12 2.1 9.4 1.6 6 4.8 4.8 6 1.6 9.4 2.1Z';

export default function ProfileCard({ className = '' }) {
  const linkedIn = SOCIALS.find((social) => social.label === 'LinkedIn');
  const verifiedClipId = `verified-${useId().replaceAll(':', '')}`;

  return (
    <div className={`profile-card-wrap ${className}`}>
      <article className="profile-card" aria-label="Roel Hingabay profile">
        <img
          className="profile-card-image"
          src="/images/profile.webp"
          alt="Roel Hingabay"
          width="400"
          height="480"
        />
        <div className="profile-card-content">
          <div className="profile-card-name-row">
            <p className="profile-card-name">Roel Hingabay</p>
            <span className="profile-card-verified" role="img" aria-label="Verified profile">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d={VERIFIED_BADGE_PATH}
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
                <defs>
                  <clipPath id={verifiedClipId}>
                    <path d={VERIFIED_BADGE_PATH} />
                  </clipPath>
                  <linearGradient id={`${verifiedClipId}-shine`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#fff" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g clipPath={`url(#${verifiedClipId})`} className="profile-card-verified-shimmer">
                  <path d="M-12 0h7l31 24h-7z" fill={`url(#${verifiedClipId}-shine)`} />
                </g>
                <path d="m6.8 12.2 3.2 3.1 7.2-7.1" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          {linkedIn && (
            <a className="profile-connect" href={linkedIn.href} target="_blank" rel="noreferrer" aria-label="Let’s connect on LinkedIn">
              <span>Let&apos;s connect</span>
              <SocialIcon label="LinkedIn" />
            </a>
          )}
        </div>
      </article>
      <div className="profile-card-extras">
        <div className="profile-card-meta">
          <div className="profile-card-meta-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span>{AVAILABILITY.location}</span>
          </div>
          <div className="profile-card-meta-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="13" rx="2" />
              <path d="M8 21h8m-4-4v4" />
            </svg>
            <span>{AVAILABILITY.arrangement}</span>
          </div>
        </div>
        <div className="profile-card-stats" aria-label="Portfolio statistics">
          <div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7h7l2 2h9v10H3z" />
              <path d="M3 7V5h7l2 2" />
            </svg>
            <strong>4</strong><span>Projects</span>
          </div>
          <div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7h7l2 2h9v10H3z" />
              <path d="M3 7V5h7l2 2" />
            </svg>
            <strong>3</strong><span>Personal Projects</span>
          </div>
        </div>
      </div>
    </div>
  );
}
