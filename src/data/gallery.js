// Photos for the Gallery section. Files live in public/images/gallery/ as WebP
// (converted from the originals, max 1600px on the long edge). Add one entry each:
//
//   { src: '/images/gallery/name.webp', alt: 'Describe what is in the photo', caption: 'Short caption' },
//
// Layout flags (all optional):
//   featured: true : the highlight tile, two columns by two rows (use on one photo)
//   tall: true     : two rows high, for portrait shots
//   wide: true     : two columns wide, for panoramic shots
//
// Order here is the order on the page and in the lightbox. Captions describe only
// what is in the frame: rename them to the actual event or team if you like.
// While this list is empty, the section shows labelled placeholder slots.
const photo = (n, alt, caption, layout = {}) => ({ src: `/images/gallery/gdfi-${n}.webp`, alt, caption, ...layout });

export const gallery = [
  photo(3, 'Group photo with the Head of DPT, COO, CFO and CEO in an office lounge', 'With our Head of DPT, COO, CFO, and CEO', { featured: true }),
  photo(1, 'A large group of colleagues posing together in a meeting room in front of a presentation screen', 'Introducing our Function us a Team', { tall: true }),
  photo(2, 'Selfie with colleagues gathered around workstations in the office', 'Team DPT'),
  photo(4, 'Selfie with a peace sign while teammates give thumbs up in a training room', 'Training room session from Zero to Hero XD'),
  photo(5, 'Selfie with smiling teammates beside an office cubicle', 'Coordinated with the Head of People and department managers to deliver system handover documentation to stakeholders and provide recommendations for establishing application governance and management policies.'),
  photo(6, 'Selfie with colleagues in company shirts at a workstation', 'Alignment with the FGS Project Proposal and Pre Discovery Sessions'),
  photo(7, 'Colleagues around a desk with laptops and a desk sign that reads Chill', 'Systems Alignment and Process Guidance with the Credit and Collection Head and CCO,Including Process Guidance and Recommendations'),
  photo(8, 'Selfie with teammates at their desks, one holding a laptop', 'Working session'),
  photo(9, 'Group photo in a meeting room in front of a screen showing a coaching session slide', 'Presentation of the Coaching Log Proposal as Part of Our Initiative'),
  photo(10, 'Presenting a Microsoft Power BI beginner’s guide on a large screen and a laptop', 'Power BI training'),
  photo(11, 'Colleagues at a long conference table with laptops during a Power BI session', 'Power BI workshop'),
  photo(12, 'Selfie with colleagues seated in an office meeting area', 'Conducted discovery sessions with the Customer Experience Head based on their proposed applications to better understand their requirements, processes, and potential opportunities for improvement.'),
  photo(13, 'Selfie with teammates around a laptop at a desk', 'Development session'),
  photo(14, 'Selfie with a group at laptops in front of a whiteboard diagram and a screen showing a system', 'System walkthrough'),
  photo(15, 'Group at yellow tables with laptops, a whiteboard of process notes behind them', 'Application HandOver'),
  photo(16, 'Selfie with a cheerful group of colleagues posing in an office corridor', 'Team photo'),
  photo(17, 'Group seated at laptops watching a system demo on a wall screen', 'System demonstration'),
];

// How many placeholder slots to show while the gallery is empty.
export const GALLERY_PLACEHOLDERS = 7;
