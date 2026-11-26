import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { GESTURES } from 'peekons';
import * as icons from 'peekons/icons';
import { codeFor, KITS, PIECES, type IconName, type Kit } from '../data/pieces';
import { PieceView } from './Piece';

const INKS = [
  ['ink', 'var(--fg)'],
  ['blue', '#2f3bd9'],
  ['tomato', '#e0522e'],
  ['teal', '#14857a'],
  ['violet', '#7048e8'],
  ['pink', '#d6336c'],
] as const;
const SPEEDS = [1, 0.5, 0.25] as const;
const NAMES = Object.keys(icons) as IconName[];

/** Ajusta la velocidad de toda animación dentro de `ref` mientras haya una mascota dibujada. */
function useSpeed(ref: React.RefObject<HTMLElement | null>, speed: number) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const apply = () => {
      for (const a of el.getAnimations({ subtree: true })) if (a.playbackRate !== speed) a.playbackRate = speed;
      raf = el.querySelector('.pk svg') ? requestAnimationFrame(apply) : 0;
    };
    const mo = new MutationObserver(() => (raf ||= requestAnimationFrame(apply)));
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref, speed]);
}

const Label = ({ children }: { children: React.ReactNode }) => <span className="font-mono text-xs text-muted">{children}</span>;

export default function Pick() {
  const [kit, setKit] = useState<Kit>('magicui');
  const [picked, setPicked] = useState('mu-shimmer');
  const [ink, setInk] = useState<string>(INKS[0][1]);
  const [gesture, setGesture] = useState<string>('auto');
  const [zoom, setZoom] = useState(1);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [mix, setMix] = useState<Record<string, IconName>>({});
  const [copied, setCopied] = useState('Copy');
  const grid = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useSpeed(grid, speed);
  useEffect(() => () => clearTimeout(timer.current), []);

  const shown = PIECES.filter((p) => p.kit === kit);
  const piece = PIECES.find((p) => p.id === picked) ?? shown[0]!;
  const iconOf = (id: string) => mix[id] ?? PIECES.find((p) => p.id === id)!.icon;
  const g = gesture === 'auto' ? undefined : gesture;
  const code = codeFor(piece, iconOf(piece.id), g);
  const shuffle = () => setMix(Object.fromEntries(shown.map((p) => [p.id, NAMES[Math.floor(Math.random() * NAMES.length)]!])));
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied('Copied');
    } catch {
      setCopied("Couldn't copy");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied('Copy'), 1500);
  };
  const credit = KITS[piece.component === 'Button' ? 'shadcn' : piece.kit];

  return (
    <MotionConfig reducedMotion="user">
      <section id="pick" className="mx-auto max-w-5xl px-6 py-28">
        <h2 className="max-w-xl text-[clamp(34px,4.6vw,52px)] leading-[1.08] font-semibold tracking-[-0.02em]">Every button gets a buddy. Pick one and keep it.</h2>
        <p className="mt-5 max-w-lg text-lg text-muted">
          Real components from shadcn/ui, Magic UI and Animata, each with a mascot behind it. Click one to see its code.
        </p>

        <div role="tablist" aria-label="Component kits" className="mt-12 flex flex-wrap gap-1">
          {(Object.keys(KITS) as Kit[]).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={k === kit}
              onClick={() => {
                setKit(k);
                setPicked(PIECES.find((p) => p.kit === k)!.id);
              }}
              className="cursor-pointer rounded-md px-3 py-1.5 font-mono text-sm text-muted transition hover:text-fg aria-selected:bg-surface aria-selected:text-fg"
            >
              {KITS[k].label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-4 border-b border-line pb-5">
          <div className="flex items-center gap-2" role="radiogroup" aria-label="Ink">
            <Label>ink</Label>
            {INKS.map(([name, color]) => (
              <button
                key={name}
                role="radio"
                aria-checked={ink === color}
                aria-label={name}
                onClick={() => setInk(color)}
                className="size-4 cursor-pointer rounded-full ring-offset-2 ring-offset-bg transition aria-checked:ring-2 aria-checked:ring-fg"
                style={{ background: color }}
              />
            ))}
          </div>
          <label className="flex items-center gap-2">
            <Label>gesture</Label>
            <select value={gesture} onChange={(e) => setGesture(e.target.value)} className="cursor-pointer rounded-md bg-surface px-2 py-1 font-mono text-xs">
              {['auto', ...Object.keys(GESTURES)].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <Label>zoom</Label>
            <input type="range" min={1} max={3} step={0.5} value={zoom} onChange={(e) => setZoom(+e.target.value)} className="w-24 accent-fg" />
            <span className="w-7 font-mono text-xs tabular-nums">{zoom}×</span>
          </label>
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Speed">
            <Label>speed</Label>
            {SPEEDS.map((s) => (
              <button key={s} role="radio" aria-checked={speed === s} onClick={() => setSpeed(s)} className="cursor-pointer rounded px-1.5 py-0.5 font-mono text-xs text-muted aria-checked:bg-surface aria-checked:text-fg">
                {s === 1 ? '1×' : s === 0.5 ? '½×' : '¼×'}
              </button>
            ))}
          </div>
          <button onClick={shuffle} className="ml-auto flex cursor-pointer items-center gap-2 font-mono text-xs text-muted hover:text-fg">
            shuffle icons
          </button>
        </div>

        <div ref={grid} style={{ '--pk-ink': ink } as React.CSSProperties}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={kit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
            >
              {shown.map((p) => (
                <li
                  key={p.id}
                  tabIndex={0}
                  aria-current={p.id === piece.id}
                  onClick={() => setPicked(p.id)}
                  onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && setPicked(p.id)}
                  className="relative grid cursor-pointer place-items-center rounded-xl px-4 pt-12 pb-8 transition-colors hover:bg-surface/60 aria-current:bg-surface"
                  style={{ minHeight: 150 + (zoom - 1) * 120 }}
                >
                  <div style={{ zoom }}>
                    <PieceView key={`${p.id}-${iconOf(p.id)}-${gesture}`} piece={p} icon={iconOf(p.id)} gesture={g} greet={false} />
                  </div>
                  <span className="absolute right-3 bottom-2 font-mono text-[11px] text-muted">
                    {p.name}, {iconOf(p.id)}
                  </span>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl bg-surface">
          <div className="flex items-center gap-3 px-5 pt-3 text-xs text-muted">
            <span>{credit.source ? <>From <a className="underline underline-offset-2" href={credit.url}>{credit.source}</a>, MIT license. The mascot is peekons.</> : 'Plain markup, any host works.'}</span>
            <button onClick={copy} className="ml-auto cursor-pointer rounded-md bg-bg px-2.5 py-1 font-mono">{copied}</button>
          </div>
          <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-relaxed"><code>{code}</code></pre>
        </div>
      </section>
    </MotionConfig>
  );
}
