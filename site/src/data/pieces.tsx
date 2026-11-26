/**
 * Lo que se muestra en el hero y en «Pick»: componentes reales de shadcn/ui, Magic UI y Animata
 * con una mascota. `render(peek)` pone la mascota donde va; `wrap` la pone en un envoltorio porque el
 * componente recorta lo que sale de su borde (`overflow: hidden`).
 */
import type { ReactNode } from 'react';
import * as icons from 'peekons/icons';
import { Duolingo, GetStartedButton, ShiningButton, SlideArrowButton, SwipeButton } from '../components/kit/animata';
import { Button } from '../components/kit/button';
import { InteractiveHoverButton } from '../components/kit/interactive-hover-button';
import { PulsatingButton } from '../components/kit/pulsating-button';
import { RainbowButton } from '../components/kit/rainbow-button';
import { RippleButton } from '../components/kit/ripple-button';
import { ShimmerButton } from '../components/kit/shimmer-button';
import { ShinyButton } from '../components/kit/shiny-button';

export type IconName = keyof typeof icons;
export type Kit = 'shadcn' | 'magicui' | 'animata' | 'beyond';

export const KITS: Record<Kit, { label: string; source?: string; url?: string; from?: string }> = {
  shadcn: { label: 'shadcn/ui', source: 'shadcn/ui', url: 'https://ui.shadcn.com', from: '@/components/ui/button' },
  magicui: { label: 'Magic UI', source: 'Magic UI', url: 'https://magicui.design', from: '@/components/magicui' },
  animata: { label: 'Animata', source: 'Animata', url: 'https://animata.design', from: '@/components/animata' },
  beyond: { label: 'Beyond buttons' },
};

export interface Piece {
  id: string;
  kit: Kit;
  name: string;
  icon: IconName;
  gesture?: string;
  wrap?: boolean;
  /** El componente que hay que importar, si viene de un kit. */
  component?: string;
  render: (peek: ReactNode) => ReactNode;
  /** El JSX con `{PEEK}` donde va la mascota. */
  code: string;
}

const shad = (id: string, name: string, icon: IconName, label: string, props: string, extra: Partial<Piece> = {}): Piece => {
  const variant = props.match(/variant="(\w+)"/)?.[1] as Parameters<typeof Button>[0]['variant'];
  const size = props.match(/size="(\w+)"/)?.[1] as Parameters<typeof Button>[0]['size'];
  return {
    id, kit: 'shadcn', name, icon, component: 'Button',
    render: (peek) => <Button variant={variant} size={size} aria-label={label === '+' ? 'Create' : undefined}>{label}{peek}</Button>,
    code: `<Button${props ? ' ' + props : ''}>\n  ${label}\n  {PEEK}\n</Button>`,
    ...extra,
  };
};

export const PIECES: Piece[] = [
  shad('sh-default', 'Default', 'mail', 'Write me', ''),
  shad('sh-secondary', 'Secondary', 'copy', 'Duplicate', 'variant="secondary"'),
  shad('sh-outline', 'Outline', 'download', 'Download', 'variant="outline"'),
  shad('sh-ghost', 'Ghost', 'settings', 'Settings', 'variant="ghost"'),
  shad('sh-destructive', 'Destructive', 'trash', 'Delete', 'variant="destructive"'),
  shad('sh-link', 'Link', 'link', 'Copy link', 'variant="link"'),
  shad('sh-large', 'Large', 'calendar', 'Book a call', 'size="lg"'),
  shad('sh-small', 'Small', 'user', 'Invite', 'variant="outline" size="sm"'),
  shad('sh-icon', 'Icon', 'plus', '+', 'size="icon"', { gesture: 'flip' }),

  { id: 'mu-shimmer', kit: 'magicui', name: 'Shimmer', icon: 'mail', component: 'ShimmerButton', wrap: true,
    render: () => <ShimmerButton className="h-10 px-5 text-sm">Write me</ShimmerButton>,
    code: `<span className="relative inline-flex">\n  <ShimmerButton>Write me</ShimmerButton>\n  {PEEK}\n</span>` },
  { id: 'mu-rainbow', kit: 'magicui', name: 'Rainbow', icon: 'github', component: 'RainbowButton',
    render: (peek) => <RainbowButton>Star on GitHub{peek}</RainbowButton>,
    code: `<RainbowButton>\n  Star on GitHub\n  {PEEK}\n</RainbowButton>` },
  { id: 'mu-rainbow-outline', kit: 'magicui', name: 'Rainbow outline', icon: 'chat', component: 'RainbowButton',
    render: (peek) => <RainbowButton variant="outline">Say hi{peek}</RainbowButton>,
    code: `<RainbowButton variant="outline">\n  Say hi\n  {PEEK}\n</RainbowButton>` },
  { id: 'mu-pulsating', kit: 'magicui', name: 'Pulsating', icon: 'bell', component: 'PulsatingButton',
    render: (peek) => <PulsatingButton>Join waitlist{peek}</PulsatingButton>,
    code: `<PulsatingButton>\n  Join waitlist\n  {PEEK}\n</PulsatingButton>` },
  { id: 'mu-shiny', kit: 'magicui', name: 'Shiny', icon: 'star', component: 'ShinyButton', wrap: true,
    render: () => <ShinyButton>Upgrade</ShinyButton>,
    code: `<span className="relative inline-flex">\n  <ShinyButton>Upgrade</ShinyButton>\n  {PEEK}\n</span>` },
  { id: 'mu-interactive', kit: 'magicui', name: 'Interactive hover', icon: 'send', component: 'InteractiveHoverButton', wrap: true,
    render: () => <InteractiveHoverButton>Get started</InteractiveHoverButton>,
    code: `<span className="relative inline-flex">\n  <InteractiveHoverButton>Get started</InteractiveHoverButton>\n  {PEEK}\n</span>` },
  { id: 'mu-ripple', kit: 'magicui', name: 'Ripple', icon: 'heart', component: 'RippleButton', wrap: true,
    render: () => <RippleButton rippleColor="#f4a3b7">Like</RippleButton>,
    code: `<span className="relative inline-flex">\n  <RippleButton rippleColor="#f4a3b7">Like</RippleButton>\n  {PEEK}\n</span>` },

  { id: 'an-duolingo', kit: 'animata', name: 'Duolingo', icon: 'check', gesture: 'flip', component: 'Duolingo',
    render: (peek) => <Duolingo>Continue{peek}</Duolingo>,
    code: `<Duolingo>\n  Continue\n  {PEEK}\n</Duolingo>` },
  { id: 'an-shining', kit: 'animata', name: 'Shining', icon: 'calendar', component: 'ShiningButton', wrap: true,
    render: () => <ShiningButton>See calendar</ShiningButton>,
    code: `<span className="relative inline-flex">\n  <ShiningButton>See calendar</ShiningButton>\n  {PEEK}\n</span>` },
  { id: 'an-swipe', kit: 'animata', name: 'Swipe', icon: 'lock', component: 'SwipeButton', wrap: true,
    render: () => <SwipeButton firstText="Get access" secondText="Unlocked" />,
    code: `<span className="relative inline-flex">\n  <SwipeButton firstText="Get access" secondText="Unlocked" />\n  {PEEK}\n</span>` },
  { id: 'an-slide', kit: 'animata', name: 'Slide arrow', icon: 'home', component: 'SlideArrowButton',
    render: (peek) => <SlideArrowButton>Go home{peek}</SlideArrowButton>,
    code: `<SlideArrowButton>\n  Go home\n  {PEEK}\n</SlideArrowButton>` },
  { id: 'an-start', kit: 'animata', name: 'Get started', icon: 'upload', component: 'GetStartedButton',
    render: (peek) => <GetStartedButton>Upload{peek}</GetStartedButton>,
    code: `<GetStartedButton>\n  Upload\n  {PEEK}\n</GetStartedButton>` },

  { id: 'by-card', kit: 'beyond', name: 'Card', icon: 'folder',
    render: (peek) => (
      <a href="#pick" className="relative block w-52 rounded-2xl border border-line bg-background p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg">
        <span className="block font-semibold">Q3 roadmap</span>
        <span className="mt-1 block text-xs text-muted">12 files, edited 2 hours ago</span>
        {peek}
      </a>
    ),
    code: `<a href="/roadmap" className="block w-52 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lg">\n  <span className="block font-semibold">Q3 roadmap</span>\n  <span className="mt-1 block text-xs text-muted-foreground">12 files, edited 2 hours ago</span>\n  {PEEK}\n</a>` },
  { id: 'by-chip', kit: 'beyond', name: 'Chip', icon: 'check', gesture: 'flip',
    render: (peek) => <span tabIndex={0} className="relative inline-flex h-8 items-center rounded-full bg-emerald-200 px-4 text-sm font-semibold text-emerald-950">Saved{peek}</span>,
    code: `<span className="inline-flex h-8 items-center rounded-full bg-emerald-200 px-4 text-sm font-semibold text-emerald-950">\n  Saved\n  {PEEK}\n</span>` },
  { id: 'by-word', kit: 'beyond', name: 'A word', icon: 'heart', gesture: 'hop',
    render: (peek) => <p className="max-w-48 text-sm text-muted">Made with <a href="#pick" className="relative font-semibold text-fg underline decoration-2 underline-offset-4">love{peek}</a> and a lot of coffee.</p>,
    code: `<p>\n  Made with{' '}\n  <a href="/about" className="font-semibold underline decoration-2 underline-offset-4">\n    love\n    {PEEK}\n  </a>{' '}\n  and a lot of coffee.\n</p>` },
  { id: 'by-field', kit: 'beyond', name: 'Field and button', icon: 'send',
    render: (peek) => (
      <form className="flex gap-1.5" onSubmit={(e) => e.preventDefault()}>
        <input type="email" aria-label="Email" placeholder="you@example.com" className="h-9 w-36 rounded-md border border-input bg-background px-3 text-sm" />
        <Button>Join{peek}</Button>
      </form>
    ),
    code: `<form className="flex gap-1.5">\n  <input type="email" placeholder="you@example.com" className="h-9 w-36 rounded-md border px-3 text-sm" />\n  <Button>\n    Join\n    {PEEK}\n  </Button>\n</form>`, component: 'Button' },
  { id: 'by-search', kit: 'beyond', name: 'Search', icon: 'search',
    render: (peek) => (
      <label className="relative flex h-9 w-48 items-center gap-2 rounded-full border border-input bg-background px-3 text-sm focus-within:border-fg">
        <input placeholder="Search docs" className="min-w-0 flex-1 bg-transparent outline-none" />
        <kbd className="font-mono text-[11px] text-muted">/</kbd>
        {peek}
      </label>
    ),
    code: `<label className="flex h-9 w-48 items-center gap-2 rounded-full border px-3 text-sm focus-within:border-foreground">\n  <input placeholder="Search docs" className="min-w-0 flex-1 bg-transparent outline-none" />\n  <kbd className="text-[11px]">/</kbd>\n  {PEEK}\n</label>` },
  { id: 'by-player', kit: 'beyond', name: 'Player', icon: 'music',
    render: (peek) => (
      <div tabIndex={0} className="relative flex w-52 items-center gap-3 rounded-2xl border border-line bg-background p-2.5 text-left">
        <span className="size-10 shrink-0 rounded-xl bg-[linear-gradient(135deg,#fb7185,#f59e0b)]" />
        <span className="min-w-0"><span className="block truncate text-sm font-semibold">Morning walk</span><span className="block text-xs text-muted">Lo-fi, 3:12</span></span>
        {peek}
      </div>
    ),
    code: `<div className="flex w-52 items-center gap-3 rounded-2xl border p-2.5">\n  <span className="size-10 rounded-xl bg-gradient-to-br from-rose-400 to-amber-500" />\n  <span>\n    <span className="block text-sm font-semibold">Morning walk</span>\n    <span className="block text-xs text-muted-foreground">Lo-fi, 3:12</span>\n  </span>\n  {PEEK}\n</div>` },
  { id: 'by-camera', kit: 'beyond', name: 'Round icon', icon: 'camera', gesture: 'hop',
    render: (peek) => <button aria-label="Take photo" className="relative grid size-12 cursor-pointer place-items-center rounded-full bg-fg text-bg transition hover:scale-105"><span className="size-4 rounded-full border-2 border-current" />{peek}</button>,
    code: `<button aria-label="Take photo" className="grid size-12 place-items-center rounded-full bg-foreground text-background transition hover:scale-105">\n  <span className="size-4 rounded-full border-2 border-current" />\n  {PEEK}\n</button>` },
  { id: 'by-social', kit: 'beyond', name: 'Social link', icon: 'x', gesture: 'hop',
    render: (peek) => <a href="#pick" className="relative text-sm font-semibold underline decoration-2 underline-offset-4">Follow on X{peek}</a>,
    code: `<a href="https://x.com/you" className="font-semibold underline decoration-2 underline-offset-4">\n  Follow on X\n  {PEEK}\n</a>` },
];

/** El código listo para copiar de una pieza, con sus imports. */
export function codeFor(p: Piece, icon: IconName, gesture?: string) {
  const g = gesture ?? p.gesture;
  const peek = `<Peekon icon={${icon}}${g ? ` gesture="${g}"` : ''} sound={chirp} />`;
  const imports = [
    `import { Peekon } from 'peekons/react';`,
    `import { ${icon} } from 'peekons/icons';`,
    `import { chirp } from 'peekons/sound';`,
    ...(p.component ? [`import { ${p.component} } from '${KITS[p.component === 'Button' ? 'shadcn' : p.kit].from}';`] : []),
  ];
  return `${imports.join('\n')}\n\n${p.code.replace('{PEEK}', peek)}`;
}
