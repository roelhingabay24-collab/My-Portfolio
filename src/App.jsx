import { lazy, Suspense, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Cursor from './components/Cursor';
import Preloader, { shouldPlayIntro } from './components/Preloader';
import Capabilities from './components/Capabilities';
import About from './components/About';
import Work from './components/Work';
import Roadmap from './components/Roadmap';
import Skills from './components/Skills';
import Certifications from './components/Certifications';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { navItems } from './data/site';
import { projects } from './data/projects';
import { useActiveSection } from './lib/hooks';
import { getLenis, scrollToTarget, startSmoothScroll, stopSmoothScroll } from './lib/smoothScroll';

// The custom cursor only makes sense for a mouse; re-checked if one is plugged in.
const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const subscribePointer = (onChange) => {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const hasFinePointer = () => window.matchMedia(FINE_POINTER).matches;

const loadProjectDialog = () => import('./components/ProjectDialog');
const ProjectDialog = lazy(loadProjectDialog);
const ResumeDialog = lazy(() => import('./components/ResumeDialog'));

export default function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openProject, setOpenProject] = useState(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const [introDone, setIntroDone] = useState(() => !shouldPlayIntro(reduceMotion));
  const finePointer = useSyncExternalStore(subscribePointer, hasFinePointer);

  // 'home' is observed but has no nav entry, so nothing is marked current at the
  // top of the page.
  const sectionIds = useMemo(() => ['home', ...navItems.map((item) => item.href.slice(1))], []);
  const activeSection = useActiveSection(sectionIds);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem('rh-theme', theme);
    } catch {
      /* storage unavailable (private mode): the in-memory theme still applies */
    }
  }, [theme]);

  // Smooth scroll is a motion effect, so reduced motion keeps native scrolling.
  useEffect(() => {
    if (reduceMotion) return undefined;
    startSmoothScroll();
    return stopSmoothScroll;
  }, [reduceMotion]);

  // Hold the page still while the intro plays.
  useEffect(() => {
    if (introDone) return undefined;
    getLenis()?.stop();
    return () => getLenis()?.start();
  }, [introDone]);

  const goTo = useCallback(
    (event, href) => {
      event.preventDefault();
      setMenuOpen(false);
      scrollToTarget(href, { instant: reduceMotion });
    },
    [reduceMotion],
  );

  const finishIntro = useCallback(() => setIntroDone(true), []);

  // The new theme is revealed as a circle growing out of the toggle button.
  // Browsers without View Transitions, and reduced motion, just switch.
  const toggleTheme = useCallback(
    (event) => {
      const next = theme === 'light' ? 'dark' : 'light';
      const apply = () => {
        document.documentElement.dataset.theme = next;
        flushSync(() => setTheme(next));
      };
      if (reduceMotion || typeof document.startViewTransition !== 'function') {
        apply();
        return;
      }
      const rect = event?.currentTarget?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
      const y = rect ? rect.top + rect.height / 2 : 32;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = document.startViewTransition(apply);
      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 620, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', pseudoElement: '::view-transition-new(root)' },
          );
        })
        .catch(() => { /* transition skipped: the theme still applied */ });
    },
    [theme, reduceMotion],
  );

  const closeProject = useCallback(() => setOpenProject(null), []);
  const closeResume = useCallback(() => setResumeOpen(false), []);

  // Resume links stay real links: modified or middle clicks still open the PDF
  // in a new tab; a plain click opens the on-page viewer instead.
  const openResume = useCallback((event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setResumeOpen(true);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onCloseMenu={() => setMenuOpen(false)}
        activeSection={activeSection}
        goTo={goTo}
        reduceMotion={reduceMotion}
      />

      <main id="main">
        <Hero goTo={goTo} reduceMotion={reduceMotion} ready={introDone} onOpenResume={openResume} />
        <Marquee reduceMotion={reduceMotion} />
        <Capabilities reduceMotion={reduceMotion} />
        <About goTo={goTo} reduceMotion={reduceMotion} />
        <Work
          onOpenProject={setOpenProject}
          onPrepareProject={loadProjectDialog}
          reduceMotion={reduceMotion}
        />
        <Roadmap reduceMotion={reduceMotion} />
        <Skills reduceMotion={reduceMotion} />
        <Certifications reduceMotion={reduceMotion} />
        <Gallery reduceMotion={reduceMotion} />
        <Testimonials reduceMotion={reduceMotion} />
        <Contact reduceMotion={reduceMotion} />
      </main>

      <Footer goTo={goTo} onOpenResume={openResume} />

      <AnimatePresence>
        {resumeOpen && (
          <Suspense fallback={null}>
            <ResumeDialog reduceMotion={reduceMotion} onClose={closeResume} />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!introDone && <Preloader key="preloader" onDone={finishIntro} />}
      </AnimatePresence>

      {finePointer && !reduceMotion && <Cursor />}

      <AnimatePresence>
        {openProject !== null && (
          <Suspense fallback={null}>
            <ProjectDialog
              project={projects[openProject]}
              reduceMotion={reduceMotion}
              onClose={closeProject}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}
