import { useRef } from 'react';
import { navItems } from '../data/site';
import { useEscape } from '../lib/hooks';
import ScrambleText from './ScrambleText';

export default function PortfolioHeader({
  theme,
  onToggleTheme,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  activeSection,
  goTo,
}) {
  const menuRef = useRef(null);
  useEscape(menuOpen, () => {
    onCloseMenu();
    menuRef.current?.focus();
  });
  const links = navItems.filter((item) => item.href !== '#contact');
  return (
    <header className="portfolio-header">
      <a
        className="portfolio-mark"
        href="#home"
        onClick={(event) => goTo(event, '#home')}
        aria-label="Roel Hingabay, back to overview"
      >
        <svg
          className="portfolio-profile-mark"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="9" r="3" />
          <path d="M5.7 19.5a6.5 6.5 0 0 1 12.6 0" />
        </svg>
        <span className="mobile-brand">Roel Hingabay</span>
      </a>
      <nav className="portfolio-nav" aria-label="Primary">
        {links.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={activeSection === item.href.slice(1) ? 'location' : undefined}
            onClick={(event) => goTo(event, item.href)}
          >
            <ScrambleText text={item.label} enabled />
          </a>
        ))}
      </nav>
      <div className="portfolio-header-actions">
        <button
          type="button"
          className="icon-btn"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          onClick={onToggleTheme}
        >
          <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
        </button>
        <a
          className="btn btn-primary header-contact"
          href="#contact"
          onClick={(event) => goTo(event, '#contact')}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z" />
          </svg>
          Contact me
        </a>
        <button
          type="button"
          className="icon-btn portfolio-menu-button"
          ref={menuRef}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="portfolio-mobile-nav"
          onClick={onToggleMenu}
        >
          <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>
      {menuOpen && (
        <nav id="portfolio-mobile-nav" className="portfolio-mobile-nav" aria-label="Primary mobile">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={activeSection === item.href.slice(1) ? 'location' : undefined}
              onClick={(event) => {
                goTo(event, item.href);
                requestAnimationFrame(() => menuRef.current?.focus({ preventScroll: true }));
              }}
            >
              <ScrambleText text={item.label} enabled />
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
