import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import PortfolioHeader from './components/PortfolioHeader';
import ProfileSidebar from './components/ProfileSidebar';
import Overview from './components/Overview';
import About from './components/About';
import Work from './components/Work';
import Roadmap from './components/Roadmap';
import Skills from './components/Skills';
import StackTools from './components/StackTools';
import Certifications from './components/Certifications';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { navItems } from './data/site';
import { projects } from './data/projects';
import { useActiveSection } from './lib/hooks';
import { scrollToTarget } from './lib/smoothScroll';

const loadProjectDialog = () => import('./components/ProjectDialog');
const ProjectDialog = lazy(loadProjectDialog);
const ResumeDialog = lazy(() => import('./components/ResumeDialog'));

export default function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openProject, setOpenProject] = useState(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const reduceMotion = useReducedMotion();

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

  const goTo = useCallback(
    (event, href) => {
      event.preventDefault();
      setMenuOpen(false);
      scrollToTarget(href, { instant: reduceMotion });
    },
    [reduceMotion],
  );

  const toggleTheme = useCallback(() => setTheme((current) => (current === 'light' ? 'dark' : 'light')), []);

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
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <ProfileSidebar />
      <div className="portfolio-content">
        <PortfolioHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((open) => !open)}
          onCloseMenu={() => setMenuOpen(false)}
          activeSection={activeSection}
          goTo={goTo}
        />

        <main id="main">
          <Overview goTo={goTo} />
          <About goTo={goTo} reduceMotion={true} />
          <Roadmap reduceMotion={true} />
          <Work onOpenProject={setOpenProject} onPrepareProject={loadProjectDialog} reduceMotion={true} />
          <StackTools reduceMotion={reduceMotion} />
          <Skills reduceMotion={true} />
          <Certifications reduceMotion={true} />
          <Gallery reduceMotion={true} />
          <Testimonials reduceMotion={reduceMotion} />
          <Contact reduceMotion={true} />
        </main>

        <Footer goTo={goTo} onOpenResume={openResume} />
      </div>

      <AnimatePresence>
        {resumeOpen && (
          <Suspense fallback={null}>
            <ResumeDialog reduceMotion={reduceMotion} onClose={closeResume} />
          </Suspense>
        )}
      </AnimatePresence>

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
