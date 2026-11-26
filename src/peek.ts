/** Un ícono de peekons: el interior de un SVG 24×24 con clases `pk-*` y el gesto que hace al salir. */
export interface PeekIcon {
  name: string;
  svg: string;
  gesture: Gesture;
  /** La voz que usa `chirp` de `peekons/sound`. */
  voice?: string;
}

/** Suena cuando la mascota sale: `peek` al hover o focus, `hello` al saludar sola. */
export type PeekSound = (icon: PeekIcon, moment: 'peek' | 'hello') => void;

export type Gesture = keyof typeof GESTURES;

export interface PeekOptions {
  /** Reemplaza el gesto propio del ícono. */
  gesture?: Gesture;
  /** Saluda solo la primera vez que el host entra en pantalla. Por defecto `true`. */
  greet?: boolean;
  /** Sonido al salir; sin él no hay audio. `chirp` de `peekons/sound` usa la voz de cada ícono. */
  sound?: PeekSound;
}

/**
 * [ms desde el inicio, translateY en %, rotate en grados, easing del tramo que termina aquí, pivote]
 * El pivote es la altura del giro en % desde la base: 0 se mece desde abajo, 50 gira sobre su centro.
 */
type Step = readonly [number, number, number, string, number?];

const BACK = 'cubic-bezier(.3,1.7,.6,1)';
const SINE = 'cubic-bezier(.37,0,.63,1)';
const UP = 'cubic-bezier(.33,1,.68,1)';
const DOWN = 'cubic-bezier(.32,0,.67,0)';
const TURN = 'cubic-bezier(.6,0,.3,1)';
const EASE_IN = 'cubic-bezier(.55,.085,.68,.53)';
const at = (y: number, r: number, pivot = 0) => `translateY(${y - pivot}%) rotate(${r}deg) translateY(${pivot}%)`;
export const HIDDEN = at(100, 0);

/** Sale por la esquina inclinado y después hace su gesto; el último cuadro se sostiene mientras dure el hover. */
export const GESTURES = {
  wink: [[670, 18, 6, SINE], [1170, 24, -4, SINE], [1670, 18, 6, SINE], [2170, 24, -4, SINE], [2670, 18, 6, SINE]],
  wave: [[560, 18, 12, SINE], [700, 18, -6, SINE], [840, 18, 12, SINE], [980, 18, -6, SINE], [1180, 18, 4, SINE]],
  nod: [[620, 32, -2, SINE], [820, 16, 0, SINE], [1020, 32, -2, SINE], [1260, 18, 0, SINE]],
  hop: [[640, -34, 4, UP], [880, 18, -4, DOWN], [1060, -12, 2, UP], [1240, 18, 0, DOWN]],
  // los cambios de pivote ocurren con rotate en 0 o 360, donde no se notan
  flip: [[560, 18, 0, SINE], [561, 18, 0, 'linear', 50], [900, -46, 180, UP, 50], [1240, 14, 360, DOWN, 50], [1241, 14, 360, 'linear'], [1420, 24, 360, SINE], [1600, 18, 360, SINE]],
  spin: [[560, 16, 0, SINE], [561, 16, 0, 'linear', 50], [1360, 16, 360, TURN, 50], [1361, 16, 360, 'linear'], [1560, 18, 360, SINE]],
} satisfies Record<string, readonly Step[]>;

const RISE: Step = [420, 18, -10, BACK];
const WINK: Keyframe[] = [
  { offset: 0, transform: 'scaleY(1)', easing: 'ease-in' },
  { offset: 0.31, transform: 'scaleY(.1)' },
  { offset: 0.54, transform: 'scaleY(.1)', easing: 'ease-out' },
  { offset: 1, transform: 'scaleY(1)' },
];
/** El saludo: sale, se inclina, guiña, espera un momento y vuelve a esconderse. */
const HELLO: Keyframe[] = [
  { offset: 0, transform: HIDDEN, easing: BACK },
  { offset: 420 / 1550, transform: at(18, -10), easing: SINE },
  { offset: 670 / 1550, transform: at(18, 6), easing: SINE },
  { offset: 1300 / 1550, transform: at(18, 2), easing: EASE_IN },
  { offset: 1, transform: HIDDEN },
];
const STAGGER = 120;
/** Cuántos saludos de una misma tanda suenan; el resto saluda en silencio para no sumar voces. */
const VOICED = 4;

/** Mascotas vivas por host; la primera fija `position: relative` si hacía falta y la última lo devuelve. */
const anchors = new WeakMap<HTMLElement, { n: number; set: boolean }>();

function anchor(host: HTMLElement) {
  const a = anchors.get(host) ?? { n: 0, set: false };
  if (a.n++ === 0 && (getComputedStyle(host).position || 'static') === 'static' && !host.style.position) {
    host.style.position = 'relative';
    a.set = true;
  }
  anchors.set(host, a);
  return () => {
    if (--a.n > 0) return;
    if (a.set) host.style.removeProperty('position');
    anchors.delete(host);
  };
}

/** El gesto si existe; si no, `fallback`. */
export const gestureOr = (gesture: string | undefined, fallback: Gesture): Gesture =>
  gesture && Object.hasOwn(GESTURES, gesture) ? (gesture as Gesture) : fallback;

const calm = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Cuadros de cada gesto, armados una vez; el primero se completa con la posición actual. */
const FRAMES = Object.fromEntries(
  Object.entries(GESTURES).map(([name, rest]) => {
    const steps: readonly Step[] = [RISE, ...rest];
    const total = steps[steps.length - 1]![0];
    const frames: Keyframe[] = steps.map(([ms, y, r, , pivot], i) => {
      const next = steps[i + 1];
      return { offset: ms / total, transform: at(y, r, pivot), ...(next && { easing: next[3] }) };
    });
    return [name, { frames, total }];
  })
) as Record<Gesture, { frames: Keyframe[]; total: number }>;

/** Un solo IntersectionObserver para todos los hosts que saludan; cada host guarda sus saludos pendientes. */
const greeters = new WeakMap<Element, Set<(delay: number, voiced: boolean) => void>>();
let watcher: IntersectionObserver | undefined;

function onSight(host: HTMLElement, hello: (delay: number, voiced: boolean) => void) {
  watcher ??= new IntersectionObserver(
    (entries) => {
      let slot = 0;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        watcher!.unobserve(e.target);
        const set = greeters.get(e.target);
        greeters.delete(e.target);
        const voiced = slot < VOICED;
        const delay = Math.min(slot++, 8) * STAGGER;
        set?.forEach((fn) => fn(delay, voiced));
      }
    },
    { rootMargin: '0px 0px -15% 0px' }
  );
  const set = greeters.get(host) ?? new Set();
  set.add(hello);
  greeters.set(host, set);
  watcher.observe(host);
  return () => {
    set.delete(hello);
    // si el host ya saludó, otro bind pudo dejar su propio set: ese no se toca
    if (set.size || greeters.get(host) !== set) return;
    greeters.delete(host);
    watcher?.unobserve(host);
  };
}

/** El SVG de un ícono como texto, listo para innerHTML o SSR. */
export const svgMarkup = (icon: PeekIcon) => `<svg viewBox="0 0 24 24" focusable="false">${icon.svg}</svg>`;

/** Crea el `<span class="pk">` vacío donde aparece la mascota, fuera del árbol de accesibilidad. */
export function mascot(): HTMLSpanElement {
  const pk = document.createElement('span');
  pk.className = 'pk';
  pk.setAttribute('aria-hidden', 'true');
  return pk;
}

/**
 * Hace que el slot `pk` (un `.pk` vacío dentro de `host`) muestre a `icon` al hover o focus y lo
 * esconda al salir. El SVG existe solo mientras actúa. Devuelve la función que suelta todo.
 */
export function bind(host: HTMLElement, pk: Element, icon: PeekIcon, opts: PeekOptions = {}): () => void {
  const move = FRAMES[gestureOr(opts.gesture, icon.gesture)];
  const ac = new AbortController();
  let svg: SVGSVGElement | null = null;
  let body: Animation | undefined;
  let blink: Animation | undefined;
  let out = false;
  let hovered = false;
  let focused = false;
  let release: (() => void) | undefined;
  let ringing: ReturnType<typeof setTimeout> | undefined;

  // un sonido que falla no debe frenar al resto de los saludos de la tanda
  const ring = (moment: 'peek' | 'hello') => {
    try {
      opts.sound?.(icon, moment);
    } catch (error) {
      globalThis.reportError?.(error);
    }
  };

  // el host se ancla al dibujar: entonces está en el DOM y su posición calculada es la real
  const draw = () => {
    release ??= anchor(host);
    if (!svg) {
      pk.innerHTML = svgMarkup(icon);
      svg = pk.firstElementChild as SVGSVGElement;
    }
    return svg;
  };
  const erase = () => {
    pk.textContent = '';
    svg = null;
  };
  // lee dónde está antes de cancelar, para que cada tramo nuevo arranque sin salto
  const stop = () => {
    clearTimeout(ringing);
    const t = svg ? getComputedStyle(svg).transform : '';
    body?.cancel();
    blink?.cancel();
    body = blink = undefined;
    return !t || t === 'none' ? HIDDEN : t;
  };
  const wink = (delay: number) => (blink = svg?.querySelector('.pk-wink')?.animate(WINK, { duration: 260, delay }));
  const settle = (a: Animation) => {
    a.onfinish = () => {
      a.cancel();
      blink?.cancel();
      erase();
    };
    body = a;
  };
  const show = () => {
    if (out || calm()) return;
    out = true;
    const from = stop();
    body = draw().animate([{ offset: 0, transform: from, easing: BACK }, ...move.frames], { duration: move.total, fill: 'forwards' });
    wink(380);
    ring('peek');
  };
  const hide = () => {
    if (!out || hovered || focused) return;
    out = false;
    const from = stop();
    settle(draw().animate([{ transform: from }, { transform: HIDDEN }], { duration: 250, easing: EASE_IN }));
  };
  const hello = (delay: number, voiced: boolean) => {
    if (out || calm()) return;
    const from = stop();
    settle(draw().animate([{ ...HELLO[0], transform: from }, ...HELLO.slice(1)], { duration: 1550, delay }));
    wink(delay + 520);
    if (voiced && opts.sound) {
      if (delay) ringing = setTimeout(() => ring('hello'), delay);
      else ring('hello');
    }
  };

  const on = <K extends keyof HTMLElementEventMap>(type: K, fn: (e: HTMLElementEventMap[K]) => void) =>
    host.addEventListener(type, fn, { signal: ac.signal });
  on('pointerenter', () => ((hovered = true), show()));
  on('pointerleave', () => ((hovered = false), hide()));
  on('focusin', () => ((focused = true), show()));
  on('focusout', (e) => {
    if (host.contains(e.relatedTarget as Node | null)) return;
    focused = false;
    hide();
  });
  const unwatch = opts.greet !== false && typeof IntersectionObserver === 'function' ? onSight(host, hello) : undefined;

  return () => {
    ac.abort();
    unwatch?.();
    stop();
    erase();
    release?.();
  };
}

/** Agrega la mascota de `icon` a `host` y la engancha. Devuelve la función que la quita. */
export function attach(host: HTMLElement, icon: PeekIcon, opts: PeekOptions = {}): () => void {
  const pk = mascot();
  host.append(pk);
  const off = bind(host, pk, icon, opts);
  return () => {
    off();
    pk.remove();
  };
}
