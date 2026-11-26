import { Peekon } from 'peekons/react';
import { star } from 'peekons/icons';
import { chirp } from '../lib/sound';
import { PIECES } from '../data/pieces';
import { PieceView } from './Piece';

const byId = (id: string) => PIECES.find((p) => p.id === id)!;
const LEFT = [
  ['mu-shimmer', 'lg:translate-x-10'],
  ['an-duolingo', 'lg:-translate-x-2'],
  ['by-chip', 'lg:translate-x-16'],
  ['sh-outline', 'lg:translate-x-4'],
  ['by-word', 'lg:-translate-x-4'],
] as const;
const RIGHT = [
  ['mu-rainbow', 'lg:-translate-x-8'],
  ['mu-pulsating', 'lg:translate-x-6'],
  ['an-slide', 'lg:-translate-x-2'],
  ['mu-ripple', 'lg:translate-x-10'],
  ['by-player', 'lg:-translate-x-6'],
] as const;

function Column({ items, label }: { items: readonly (readonly [string, string])[]; label: string }) {
  return (
    <ul aria-label={label} className="grid grid-cols-2 place-items-center gap-x-4 gap-y-14 lg:grid-cols-1 lg:gap-y-20">
      {items.map(([id, nudge]) => (
        <li key={id} className={nudge}>
          <PieceView piece={byId(id)} />
        </li>
      ))}
    </ul>
  );
}

/** El nombre al centro y componentes de verdad alrededor; sus mascotas saludan solas al cargar. */
export default function Hero() {
  return (
    <section id="peekons" className="relative mx-auto grid min-h-dvh max-w-7xl items-center gap-16 px-6 pt-24 pb-16 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
      <div className="order-2 lg:order-1">
        <p className="mb-3 hidden -rotate-3 pl-24 font-mono text-xs text-muted lg:block">
          hover to peek
          <svg viewBox="0 0 40 40" className="ml-6 inline-block size-9 -scale-x-100 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="M6 4c10 3 22 12 24 30M30 34l-7-4M30 34l3-8" />
          </svg>
        </p>
        <Column items={LEFT} label="Buttons with mascots" />
      </div>
      <div className="order-1 text-center lg:order-2">
        <h1 className="relative inline-block text-[clamp(68px,11vw,152px)] leading-none font-bold tracking-[-0.035em] [--pk-inset:0.06em] [--pk-size:0.3em]">
          peekons
          <Peekon icon={star} gesture="hop" sound={chirp} />
        </h1>
        <p className="mx-auto mt-6 max-w-sm text-lg text-muted">
          Icons that peek out of your buttons.
          <br />
          Hover one and it says hi.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button data-copy="npm i peekons" className="inline-flex h-11 cursor-pointer items-center gap-3 rounded-full bg-fg pr-1.5 pl-5 font-mono text-sm text-bg">
            npm i peekons
            <span data-copy-label className="rounded-full bg-bg/15 px-3 py-1.5 font-sans text-xs">Copy</span>
          </button>
          <a href="#pick" className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold hover:bg-surface">Pick a button</a>
        </div>
      </div>
      <div className="order-3">
        <Column items={RIGHT} label="More buttons with mascots" />
      </div>
    </section>
  );
}
