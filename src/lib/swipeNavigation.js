// Touch gestures share the same navigation callbacks as the arrow buttons.
export function createSwipeNavigation({ enabled, onNext, onPrev }) {
  if (!enabled) return {};

  let start = null;
  let suppressClick = false;

  const track = (touches) => {
    if (!start) return null;
    if (touches.length !== 1 || touches[0].identifier !== start.id) {
      start = null;
      return null;
    }
    const dx = touches[0].clientX - start.x;
    const dy = touches[0].clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) >= 10) {
      suppressClick = true;
      if (Math.abs(dy) >= Math.abs(dx)) start = null;
    }
    return start ? { dx, dy } : null;
  };

  return {
    onTouchStart(event) {
      suppressClick = false;
      const touch = event.touches[0];
      start = event.touches.length === 1
        ? { id: touch.identifier, x: touch.clientX, y: touch.clientY }
        : null;
    },
    onTouchMove(event) {
      track(event.touches);
    },
    onTouchEnd(event) {
      const movement = event.touches.length === 0 ? track(event.changedTouches) : null;
      start = null;
      if (!movement || Math.abs(movement.dx) < 50 || Math.abs(movement.dx) < Math.abs(movement.dy) * 1.5) return;
      if (movement.dx < 0) onNext();
      else onPrev();
    },
    onTouchCancel() {
      start = null;
      suppressClick = false;
    },
    onClickCapture(event) {
      // Keyboard activation remains available after a touch gesture.
      if (!suppressClick || event.detail === 0) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}
