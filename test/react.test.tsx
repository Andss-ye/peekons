import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mail } from '../src/icons/index.js';
import { Peekon } from '../src/react.js';
import { installAnimate, installIO, intersect, live, made, observed, reduceMotion } from './fake-animate.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(() => {
  installAnimate();
  installIO();
  reduceMotion(false);
  document.body.innerHTML = '<div id="root"></div>';
});
afterEach(() => vi.restoreAllMocks());

it('renders only an empty mascot slot on the server', () => {
  const html = renderToString(
    <button>
      Write me
      <Peekon icon={mail} />
    </button>
  );
  expect(html).toContain('class="pk"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).not.toContain('<svg');
});

it('peeks from its parent and lets go of everything on unmount', () => {
  const root = createRoot(document.getElementById('root')!);
  act(() =>
    root.render(
      <button>
        Write me
        <Peekon icon={mail} />
      </button>
    )
  );
  const button = document.querySelector('button')!;
  button.dispatchEvent(new PointerEvent('pointerenter'));
  expect(button.style.position).toBe('relative');
  expect(live().length).toBeGreaterThan(0);
  act(() => root.unmount());
  expect(live()).toHaveLength(0);
  const n = made.length;
  button.dispatchEvent(new PointerEvent('pointerenter'));
  expect(made).toHaveLength(n);
});

it('stays anchored when React rewrites the parent className', () => {
  const root = createRoot(document.getElementById('root')!);
  const view = (cls: string) => (
    <button className={cls}>
      Go
      <Peekon icon={mail} />
    </button>
  );
  act(() => root.render(view('btn')));
  document.querySelector('button')!.dispatchEvent(new PointerEvent('pointerenter'));
  act(() => root.render(view('btn on')));
  expect(document.querySelector('button')!.style.position).toBe('relative');
  act(() => root.unmount());
});

it('a new icon object with the same drawing does not rebind', () => {
  const root = createRoot(document.getElementById('root')!);
  const view = () => (
    <button>
      Go
      <Peekon icon={{ ...mail }} />
    </button>
  );
  act(() => root.render(view()));
  const button = document.querySelector('button')!;
  button.dispatchEvent(new PointerEvent('pointerenter'));
  const n = live().length;
  act(() => root.render(view()));
  expect(live()).toHaveLength(n);
  act(() => root.unmount());
});

it('greet={false} keeps it still until someone hovers', () => {
  const root = createRoot(document.getElementById('root')!);
  act(() =>
    root.render(
      <button>
        Go
        <Peekon icon={mail} greet={false} />
      </button>
    )
  );
  const button = document.querySelector('button')!;
  expect(observed(button)).toBe(false);
  intersect(button);
  expect(made).toHaveLength(0);
  act(() => root.unmount());
});

it('an inline sound function does not rebind on every render', () => {
  const root = createRoot(document.getElementById('root')!);
  const view = () => (
    <button>
      Go
      <Peekon icon={mail} greet={false} sound={() => {}} />
    </button>
  );
  act(() => root.render(view()));
  const button = document.querySelector('button')!;
  button.dispatchEvent(new PointerEvent('pointerenter'));
  const n = live().length;
  act(() => root.render(view()));
  expect(live()).toHaveLength(n);
  act(() => root.unmount());
});
