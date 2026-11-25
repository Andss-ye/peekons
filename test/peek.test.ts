import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attach, HIDDEN, mount } from '../src/index.js';
import { camera, github, linkedin, mail } from '../src/icons/index.js';
import { installAnimate, installIO, intersect, live, made, observed, reduceMotion } from './fake-animate.js';

const enter = (el: Element) => el.dispatchEvent(new PointerEvent('pointerenter'));
const leave = (el: Element) => el.dispatchEvent(new PointerEvent('pointerleave'));
const svgOf = (host: Element) => host.querySelector('.pk svg')!;

let host: HTMLButtonElement;
beforeEach(() => {
  installAnimate();
  installIO();
  reduceMotion(false);
  document.body.innerHTML = '<button>Write me</button><input id="out" />';
  host = document.querySelector('button')!;
});
afterEach(() => vi.restoreAllMocks());

describe('attach', () => {
  it('injects one empty mascot slot without touching the host text', () => {
    attach(host, mail);
    const pk = host.querySelectorAll('.pk');
    expect(pk).toHaveLength(1);
    expect(pk[0]!.childNodes).toHaveLength(0);
    expect(pk[0]!.getAttribute('aria-hidden')).toBe('true');
    expect(host.firstChild!.textContent).toBe('Write me');
    expect(made).toHaveLength(0);
  });

  it('starts rising right away from where it is', () => {
    attach(host, mail, { greet: false });
    enter(host);
    const [first, second] = made.find((a) => a.target === svgOf(host))!.keyframes;
    expect(first!.offset).toBe(0);
    expect(first!.transform).toBe(HIDDEN);
    expect(second!.transform).toContain('rotate(-10deg)');
  });

  it('peeks on hover: the body holds its last frame and the right eye winks', () => {
    attach(host, mail);
    enter(host);
    const body = made.find((a) => a.target === svgOf(host))!;
    expect(body.options.fill).toBe('forwards');
    expect(made.some((a) => a.target.classList.contains('pk-wink'))).toBe(true);
  });

  it('ignores a second hover while it is already out', () => {
    attach(host, mail);
    enter(host);
    const n = made.length;
    enter(host);
    expect(made).toHaveLength(n);
  });

  it('hides on leave and lets go of every animation once hidden', () => {
    attach(host, mail);
    enter(host);
    leave(host);
    const hide = made.at(-1)!;
    expect(hide.keyframes.at(-1)!.transform).toBe(HIDDEN);
    made.filter((a) => a !== hide).forEach((a) => expect(a.state).toBe('idle'));
    hide.finish();
    expect(live()).toHaveLength(0);
    expect(host.querySelector('.pk')!.childNodes).toHaveLength(0);
  });

  it('a fast leave and come back peeks again from where it is', () => {
    attach(host, mail);
    enter(host);
    leave(host);
    enter(host);
    expect(made.filter((a) => a.target === svgOf(host)).at(-1)!.options.fill).toBe('forwards');
    expect(live().filter((a) => a.target === svgOf(host))).toHaveLength(1);
  });

  it('detach removes the mascot, the class, the listeners and running animations', () => {
    const off = attach(host, mail);
    enter(host);
    off();
    expect(host.querySelector('.pk')).toBeNull();
    expect(host.style.position).toBe('');
    expect(live()).toHaveLength(0);
    const n = made.length;
    enter(host);
    expect(made).toHaveLength(n);
  });

  it('does not move with reduced motion', () => {
    reduceMotion(true);
    attach(host, mail);
    enter(host);
    expect(made).toHaveLength(0);
  });

  it('keyboard focus peeks; focus moving inside the host keeps it out', () => {
    document.body.innerHTML = '<div class="card"><a href="#">a</a><a href="#">b</a></div><input id="out" />';
    const card = document.querySelector<HTMLElement>('.card')!;
    const [a, b] = card.querySelectorAll('a');
    attach(card, github);
    a!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    const n = made.length;
    expect(n).toBeGreaterThan(0);
    a!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: b }));
    expect(made).toHaveLength(n);
    b!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.getElementById('out') }));
    expect(made.at(-1)!.keyframes.at(-1)!.transform).toBe(HIDDEN);
  });

  it('a gesture option replaces the icon gesture', () => {
    attach(host, mail, { gesture: 'hop' });
    enter(host);
    const frames = made.find((a) => a.target === svgOf(host))!.keyframes;
    expect(frames.some((f) => /translateY\(-/.test(String(f.transform)))).toBe(true);
  });
});

describe('greet', () => {
  const greetOf = (h: Element) => made.filter((a) => a.target === svgOf(h) && a.options.duration === 1550).at(-1)!;

  it('says hello once when the host comes into view, then lets go of everything', () => {
    attach(host, mail);
    expect(observed(host)).toBe(true);
    intersect(host);
    const hello = greetOf(host);
    expect(hello.options.fill).toBeUndefined();
    expect(hello.keyframes.at(-1)!.transform).toBe(HIDDEN);
    expect(observed(host)).toBe(false);
    hello.finish();
    expect(live()).toHaveLength(0);
    expect(host.querySelector('.pk')!.childNodes).toHaveLength(0);
  });

  it('hosts arriving together say hello in a short cascade', () => {
    document.body.innerHTML = '<a>1</a><a>2</a><a>3</a>';
    const hosts = [...document.querySelectorAll('a')];
    hosts.forEach((h) => attach(h, mail));
    intersect(...hosts);
    expect(hosts.map((h) => greetOf(h).options.delay)).toEqual([0, 120, 240]);
  });

  it('greet: false never moves on its own', () => {
    attach(host, mail, { greet: false });
    expect(observed(host)).toBe(false);
    intersect(host);
    expect(made).toHaveLength(0);
  });

  it('does not greet with reduced motion', () => {
    reduceMotion(true);
    attach(host, mail);
    intersect(host);
    expect(made).toHaveLength(0);
  });

  it('a hover during the hello takes over', () => {
    attach(host, mail);
    intersect(host);
    const hello = greetOf(host);
    enter(host);
    expect(hello.state).toBe('idle');
    expect(made.filter((a) => a.target === svgOf(host)).at(-1)!.options.fill).toBe('forwards');
  });

  it('removing the first mascot keeps the hello of a later one on the same host', () => {
    const offA = attach(host, mail);
    intersect(host);
    attach(host, github);
    offA();
    expect(observed(host)).toBe(true);
  });

  it('a hello during a hide starts from where the mascot is', () => {
    attach(host, mail);
    enter(host);
    leave(host);
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ transform: 'matrix(1, 0, 0, 1, 0, 9)' } as CSSStyleDeclaration);
    intersect(host);
    expect(greetOf(host).keyframes[0]!.transform).toBe('matrix(1, 0, 0, 1, 0, 9)');
  });

  it('cleanup stops a hello that has not happened yet', () => {
    const off = attach(host, mail);
    off();
    expect(observed(host)).toBe(false);
    intersect(host);
    expect(made).toHaveLength(0);
  });
});

describe('gestures', () => {
  it.each(['flip', 'spin'] as const)('%s turns a full circle', (gesture) => {
    attach(host, mail, { gesture, greet: false });
    enter(host);
    const frames = made.find((a) => a.target === svgOf(host))!.keyframes;
    expect(frames.some((f) => String(f.transform).includes('rotate(360deg)'))).toBe(true);
  });
});

describe('host', () => {
  it('anchors the host only once a mascot is drawn, so a detached host keeps its stylesheet position', () => {
    const loose = document.createElement('button');
    attach(loose, mail, { greet: false });
    expect(loose.style.position).toBe('');
    document.body.append(loose);
    enter(loose);
    expect(loose.style.position).toBe('relative');
  });

  it('keeps a position the author already set', () => {
    host.style.position = 'absolute';
    attach(host, mail)();
    expect(host.style.position).toBe('absolute');
  });

  it('two mascots on one host: removing one keeps the other anchored', () => {
    const offA = attach(host, mail);
    attach(host, github);
    enter(host);
    offA();
    expect(host.style.position).toBe('relative');
  });

  it('hover leaving while the host keeps focus does not hide it', () => {
    attach(host, mail);
    host.dispatchEvent(new FocusEvent('focusin'));
    enter(host);
    leave(host);
    expect(made.some((a) => a.keyframes.at(-1)!.transform === HIDDEN)).toBe(false);
    host.dispatchEvent(new FocusEvent('focusout', { relatedTarget: document.getElementById('out') }));
    expect(made.at(-1)!.keyframes.at(-1)!.transform).toBe(HIDDEN);
  });

  it('starts from hidden when no transform is computed yet', () => {
    reduceMotion(false);
    attach(host, mail);
    enter(host);
    expect(made.find((a) => a.target === svgOf(host))!.keyframes[0]!.transform).toBe(HIDDEN);
  });
});

describe('mount', () => {
  it('an empty, unknown or prototype gesture name falls back to the icon gesture', () => {
    document.body.innerHTML =
      '<a data-peekon="camera" data-peekon-gesture="">a</a><a data-peekon="camera" data-peekon-gesture="constructor">b</a>';
    mount({ camera });
    for (const a of document.querySelectorAll('a')) {
      expect(() => enter(a)).not.toThrow();
      const frames = made.filter((m) => m.target === svgOf(a)).at(-1)!.keyframes;
      expect(frames.some((f) => /translateY\(-/.test(String(f.transform)))).toBe(true);
    }
  });

  it('greet can be turned off for all hosts or for one', () => {
    document.body.innerHTML = '<a data-peekon="mail">a</a><a data-peekon="mail" data-peekon-greet="false">b</a>';
    const [a, b] = document.querySelectorAll('a');
    const off = mount({ mail });
    expect([observed(a!), observed(b!)]).toEqual([true, false]);
    off();
    mount({ mail }, { greet: false });
    expect(observed(a!)).toBe(false);
  });

  it('wires the root itself when it is a host', () => {
    document.body.innerHTML = '<a data-peekon="mail">m</a>';
    mount({ mail }, { root: document.querySelector('a')! });
    expect(document.querySelectorAll('.pk')).toHaveLength(1);
  });

  it('wires every [data-peekon] it knows and warns on unknown names', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.body.innerHTML =
      '<a data-peekon="mail">m</a><a data-peekon="linkedin" data-peekon-gesture="nod">l</a><a data-peekon="nope">n</a>';
    const off = mount({ mail, linkedin });
    expect(document.querySelectorAll('.pk')).toHaveLength(2);
    expect(document.querySelector('[data-peekon="nope"] .pk')).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('nope'));
    off();
    expect(document.querySelectorAll('.pk')).toHaveLength(0);
  });

  it('mounting twice does not stack mascots', () => {
    document.body.innerHTML = '<a data-peekon="mail">m</a>';
    mount({ mail });
    mount({ mail });
    expect(document.querySelectorAll('.pk')).toHaveLength(1);
  });
});
