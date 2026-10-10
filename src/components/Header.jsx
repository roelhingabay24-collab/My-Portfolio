import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { navItems } from '../data/site';
import { useEscape } from '../lib/hooks';
import { magnetic } from '../lib/motion';
import ScrambleText from './ScrambleText';

export default function Header({ theme, onToggleTheme, menuOpen, onToggleMenu, onCloseMenu, activeSection, goTo, reduceMotion }) {
  const menuButtonRef = useRef(null);

  const closeMenu = () => {
    onCloseMenu();
    menuButtonRef.current?.focus();
  };

  useEscape(menuOpen, closeMenu);

  return (
    <>
      <header className="site-header">
        <div className="shell header-inner">
          <a className="brand" href="#home" onClick={(event) => goTo(event, '#home')}>
            <span className="brand-mark" aria-hidden="true">R</span>
            Roel Hingabay
          </a>

          <nav className="desktop-nav" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={activeSection === item.href.slice(1) ? 'true' : undefined}
                onClick={(event) => goTo(event, item.href)}
              >
                <ScrambleText text={item.label} />
              </a>
            ))}
          </nav>

          <a className="header-cta" {...magnetic(reduceMotion, 0.25)} href="#contact" onClick={(event) => goTo(event, '#contact')}>
            Let&rsquo;s talk <span aria-hidden="true">&rarr;</span>
          </a>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              {...magnetic(reduceMotion, 0.4)}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              onClick={onToggleTheme}
            >
              <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
            </button>
            <button
              type="button"
              className="icon-btn menu-btn"
              ref={menuButtonRef}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={onToggleMenu}
            >
              <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Primary mobile"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={activeSection === item.href.slice(1) ? 'true' : undefined}
                onClick={(event) => {
                  goTo(event, item.href);
                  requestAnimationFrame(() => menuButtonRef.current?.focus());
                }}
              >
                {item.label}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
