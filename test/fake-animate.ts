/**
 * Element.animate de mentira para happy-dom: registra cada animación con su objetivo y keyframes.
 * `live()` son las que siguen vivas (ni canceladas ni terminadas).
 */
import { vi } from 'vitest';

export interface Fake {
  target: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  state: 'running' | 'finished' | 'idle';
  cancel: () => void;
  finish: () => void;
  onfinish: (() => void) | null;
}

export const made: Fake[] = [];
export const live = () => made.filter((a) => a.state === 'running' || (a.state === 'finished' && a.options.fill === 'forwards'));

export function installAnimate() {
  made.length = 0;
  Element.prototype.animate = vi.fn(function (this: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
    const a: Fake = {
      target: this,
      keyframes,
      options,
      state: 'running',
      onfinish: null,
      cancel: () => void (a.state = 'idle'),
      finish: () => {
        a.state = 'finished';
        a.onfinish?.();
      },
    };
    made.push(a);
    return a as unknown as Animation;
  }) as unknown as Element['animate'];
}

export function reduceMotion(on: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (q: string) => ({ matches: on && q.includes('reduce'), media: q }) as MediaQueryList
  );
}

/** IntersectionObserver de mentira: `intersect(...els)` entrega una sola tanda a quien los observe. */
const observers = new Set<{ cb: IntersectionObserverCallback; els: Set<Element> }>();
export const observed = (el: Element) => [...observers].some((o) => o.els.has(el));

// se instala una vez: el motor guarda un solo observer por página
export function installIO() {
  if ((globalThis.IntersectionObserver as { fake?: boolean } | undefined)?.fake) return;
  globalThis.IntersectionObserver = class {
    static fake = true;
    private o: { cb: IntersectionObserverCallback; els: Set<Element> };
    constructor(cb: IntersectionObserverCallback) {
      this.o = { cb, els: new Set() };
      observers.add(this.o);
    }
    observe(el: Element) {
      this.o.els.add(el);
    }
    unobserve(el: Element) {
      this.o.els.delete(el);
    }
    disconnect() {
      this.o.els.clear();
    }
  } as unknown as typeof IntersectionObserver;
}

export function intersect(...els: Element[]) {
  for (const o of observers) {
    const hit = els.filter((el) => o.els.has(el));
    if (hit.length) o.cb(hit.map((target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry), o as never);
  }
}
