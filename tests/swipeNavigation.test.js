import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSwipeNavigation } from '../src/lib/swipeNavigation.js';

const touch = (x, y = 100, identifier = 1) => ({ clientX: x, clientY: y, identifier });
function setup(enabled = true) {
  const navigations = [];
  const handlers = createSwipeNavigation({
    enabled,
    onNext: () => navigations.push('next'),
    onPrev: () => navigations.push('prev'),
  });
  const begin = (point = touch(200)) => handlers.onTouchStart({ touches: [point] });
  const end = (point) => handlers.onTouchEnd({ touches: [], changedTouches: [point] });
  return { handlers, navigations, begin, end };
}

test('left and right swipes each navigate once, including at the threshold', () => {
  const { handlers, navigations, begin, end } = setup();
  begin();
  handlers.onTouchMove({ touches: [touch(120)] });
  assert.deepEqual(navigations, []);
  end(touch(100));
  end(touch(100));
  begin();
  end(touch(250));
  assert.deepEqual(navigations, ['next', 'prev']);
});

test('taps, short drags, and diagonal gestures do not navigate', () => {
  const { navigations, begin, end } = setup();
  for (const point of [touch(200), touch(151), touch(140, 145)]) {
    begin();
    end(point);
  }
  assert.deepEqual(navigations, []);
});

test('vertical scrolling stays rejected even if the gesture later moves horizontally', () => {
  const { handlers, navigations, begin, end } = setup();
  begin();
  handlers.onTouchMove({ touches: [touch(195, 120)] });
  end(touch(100, 120));
  assert.deepEqual(navigations, []);
});

test('multi-touch and changed finger identifiers do not navigate', () => {
  const { handlers, navigations, begin, end } = setup();
  handlers.onTouchStart({ touches: [touch(200), touch(210, 100, 2)] });
  end(touch(100));
  begin();
  handlers.onTouchMove({ touches: [touch(200), touch(210, 100, 2)] });
  end(touch(100));
  begin();
  end(touch(100, 100, 2));
  begin();
  handlers.onTouchEnd({ touches: [touch(210, 100, 2)], changedTouches: [touch(100)] });
  end(touch(100, 100, 2));
  assert.deepEqual(navigations, []);
});

test('cancelled gestures do not navigate and the next swipe still works', () => {
  const { handlers, navigations, begin, end } = setup();
  begin();
  handlers.onTouchCancel();
  end(touch(100));
  begin();
  end(touch(100));
  assert.deepEqual(navigations, ['next']);
});

test('swipes suppress the generated click while taps and keyboard activation still work', () => {
  const { handlers, begin, end } = setup();
  let prevented = 0;
  let stopped = 0;
  const click = (detail = 1) => handlers.onClickCapture({
    detail,
    preventDefault: () => prevented++,
    stopPropagation: () => stopped++,
  });
  begin();
  end(touch(100));
  click(0);
  assert.equal(prevented, 0);
  click();
  assert.equal(prevented, 1);
  assert.equal(stopped, 1);
  click();
  begin();
  end(touch(200));
  click();
  assert.equal(prevented, 1);
  begin();
  end(touch(175));
  click();
  assert.equal(prevented, 2);
});

test('disabled navigation exposes no gesture or click handlers', () => {
  assert.deepEqual(setup(false).handlers, {});
});
