import { expect, it } from 'vitest';
import * as icons from '../src/icons/index.js';
import { GESTURES } from '../src/peek.js';

const all = Object.values(icons);

it.each(all.map((i) => [i.name, i] as const))('%s has a winking eye, a known gesture and stays small', (_, icon) => {
  expect(icon.svg).toContain('pk-wink');
  expect(icon.svg).toContain('pk-eye');
  expect(Object.keys(GESTURES)).toContain(icon.gesture);
  expect(icon.svg).not.toMatch(/<(script|style|foreignObject)|\son\w+=|href=/i);
  expect(new TextEncoder().encode(icon.svg).length).toBeLessThan(1200);
});
