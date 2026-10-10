// Shared entrance animation for sections and cards.
export function reveal(reduceMotion, delay = 0) {
  return {
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    whileInView: reduceMotion ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
  };
}

// Feeds the pointer position to a card's spotlight gradient (--mx / --my).
export function trackSpotlight(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
}

export function trackTilt(event) {
  if (event.pointerType !== 'mouse') return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  event.currentTarget.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
  event.currentTarget.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`);
}

export function resetTilt(event) {
  event.currentTarget.style.setProperty('--tilt-x', '0deg');
  event.currentTarget.style.setProperty('--tilt-y', '0deg');
}

// Card thumbnail and dialog figure share this id, so the preview morphs between them.
export const projectMediaId = (number) => `project-media-${number}`;
export const morph = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };

// Magnetic pull toward the pointer. Uses the individual `translate` property so
// it composes with any hover `transform` the element already has.
export function trackMagnet(event) {
  if (event.pointerType !== 'mouse') return;
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = event.clientX - (rect.left + rect.width / 2);
  const y = event.clientY - (rect.top + rect.height / 2);
  const strength = Number(el.dataset.magnet) || 0.3;
  el.style.translate = `${(x * strength).toFixed(1)}px ${(y * strength).toFixed(1)}px`;
}

export function resetMagnet(event) {
  event.currentTarget.style.translate = '';
}

// Spread onto any element to make it magnetic; a no-op under reduced motion.
export function magnetic(reduceMotion, strength) {
  if (reduceMotion) return {};
  return {
    'data-magnet': strength,
    onPointerMove: trackMagnet,
    onPointerLeave: resetMagnet,
  };
}
