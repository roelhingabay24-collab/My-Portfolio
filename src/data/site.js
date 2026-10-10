export const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

export const principles = [
  'Practical by design',
  'Automation first',
  'Data-driven decisions',
  'Continuous learning',
];

// Resume PDF added from the user-provided file in public/resume.pdf.
export const RESUME_URL = '/resume.pdf';
// Rendered image of the PDF page for the on-page viewer. Re-render it whenever
// resume.pdf changes, or the preview will show the old version.
export const RESUME_PREVIEW = '/resume-preview.webp';

export const CONTACT = {
  email: 'roelhingabay24@gmail.com',
  // Create a free Web3Forms access key for this inbox and set it as
  // VITE_WEB3FORMS_ACCESS_KEY at build time. The key is designed for client use.
  formAccessKey: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '',
  formEndpoint: 'https://api.web3forms.com/submit',
};

// EDIT THESE: they state what you are actually looking for, and only you know
// that. They appear in the hero badge, the About card, and the Contact section.
export const AVAILABILITY = {
  badge: 'Available for new work',
  openTo: 'Full-time, contract, or freelance',
  arrangement: 'Remote or hybrid',
  roles: 'Digital Solutions Analyst, developer, and low-code roles',
};

export const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/roel-collab' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/roel-hingabay-879665337/' },
  { label: 'Instagram', href: 'https://www.instagram.com/roel_jgram/' },
];
