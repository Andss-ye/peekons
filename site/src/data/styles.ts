/**
 * Estilos de la galería. Un estilo `button` genera su vista y su código desde la misma clase;
 * los demás traen su HTML (con `data-peekon`) y su JSX escritos a mano.
 */
export interface Style {
  id: string;
  name: string;
  note: string;
  family: 'buttons' | 'beyond';
  icon: string;
  gesture?: string;
  /** Fondo del recuadro de vista previa, si el estilo necesita uno. */
  stage?: string;
  html: string;
  code: string;
}

const BASE = 'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition';

/** Las clases de cada botón, también usadas por el playground. */
export const BUTTONS = {
  solid: `${BASE} h-9 rounded-md bg-zinc-900 px-4 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200`,
  secondary: `${BASE} h-9 rounded-md bg-zinc-100 px-4 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700`,
  outline: `${BASE} h-9 rounded-md border border-zinc-300 bg-white px-4 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900`,
  ghost: `${BASE} h-9 rounded-md px-4 text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800`,
  destructive: `${BASE} h-9 rounded-md bg-red-600 px-4 text-white hover:bg-red-700`,
  link: `${BASE} h-9 px-1 text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50`,
  soft: `${BASE} h-9 rounded-md bg-indigo-500/12 px-4 text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-300`,
  surface: `${BASE} h-9 rounded-md bg-sky-50 px-4 text-sky-800 ring-1 ring-sky-200 ring-inset hover:ring-sky-400 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-800`,
  tonal: `${BASE} h-10 rounded-full bg-violet-100 px-6 text-violet-900 hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-100`,
  fab: `${BASE} size-14 rounded-2xl bg-teal-200 text-2xl text-teal-950 shadow-md hover:shadow-lg dark:bg-teal-800 dark:text-teal-50`,
  pill: `${BASE} h-11 rounded-full bg-zinc-900 px-6 text-base text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200`,
  shine: `${BASE} h-10 rounded-lg bg-[linear-gradient(110deg,#4f46e5,45%,#a5b4fc,55%,#4f46e5)] bg-[length:200%_100%] px-5 text-white transition-[background-position] duration-700 hover:bg-[position:100%_0]`,
  glass: `${BASE} h-10 rounded-xl bg-white/20 px-5 text-white ring-1 ring-white/40 backdrop-blur-md hover:bg-white/30`,
  brutal: `${BASE} h-10 border-2 border-zinc-900 bg-yellow-300 px-5 font-bold text-zinc-900 shadow-[4px_4px_0_0_#18181b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#18181b]`,
} as const;
export type ButtonStyle = keyof typeof BUTTONS;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const attrs = (icon: string, gesture?: string) => `data-peekon="${icon}"${gesture ? ` data-peekon-gesture="${gesture}"` : ''}`;
const peekon = (icon: string, gesture?: string) => `<Peekon icon={${icon}}${gesture ? ` gesture="${gesture}"` : ''} />`;

function button(id: ButtonStyle, name: string, note: string, icon: string, label: string, extra: Partial<Style> = {}): Style {
  const aria = label.length === 1 ? ' aria-label="Create"' : '';
  return {
    id,
    name,
    note,
    family: 'buttons',
    icon,
    html: `<button class="${BUTTONS[id]}"${aria} ${attrs(icon, extra.gesture)}>${esc(label)}</button>`,
    code: `<button className="${BUTTONS[id]}"${aria}>\n  ${label}\n  ${peekon(icon, extra.gesture)}\n</button>`,
    ...extra,
  };
}

export const STYLES: Style[] = [
  button('solid', 'Solid', 'The main action on a page.', 'lock', 'Sign in'),
  button('secondary', 'Secondary', 'A quieter action next to the main one.', 'copy', 'Duplicate'),
  button('outline', 'Outline', 'Bordered, for actions that should not shout.', 'download', 'Download'),
  button('ghost', 'Ghost', 'Only shows its shape on hover. Toolbars, menus.', 'settings', 'Settings'),
  button('destructive', 'Destructive', 'For actions that cannot be undone.', 'trash', 'Delete'),
  button('link', 'Link', 'Looks like text, acts like a button.', 'link', 'Copy link'),
  button('soft', 'Soft', 'A tinted background with no border.', 'star', 'Star'),
  button('surface', 'Surface', 'Tinted background with an inner ring.', 'calendar', 'Book a call'),
  button('tonal', 'Tonal', 'Rounded and softly filled.', 'upload', 'Upload'),
  button('fab', 'Floating action', 'One big, round action for the whole screen.', 'plus', '+', { gesture: 'flip' }),
  button('pill', 'Pill', 'Fully rounded and a bit larger, for checkout flows.', 'cart', 'Add to cart'),
  button('shine', 'Shine', 'A gradient that slides on hover.', 'send', 'Send invite'),
  button('glass', 'Glass', 'Frosted, on top of a photo or a gradient.', 'camera', 'Take photo', {
    stage: 'bg-[linear-gradient(135deg,#f472b6,#818cf8_55%,#22d3ee)]',
  }),
  button('brutal', 'Brutalist', 'Thick border, hard shadow, presses in.', 'heart', 'Like'),
  {
    id: 'inbox',
    name: 'With a count',
    note: 'A button that carries a number.',
    family: 'buttons',
    icon: 'bell',
    html: `<button class="${BUTTONS.outline}" data-peekon="bell">Inbox <span class="rounded-full bg-zinc-900 px-1.5 text-xs leading-5 text-white dark:bg-zinc-50 dark:text-zinc-900">3</span></button>`,
    code: `<button className="${BUTTONS.outline}">\n  Inbox\n  <span className="rounded-full bg-zinc-900 px-1.5 text-xs leading-5 text-white dark:bg-zinc-50 dark:text-zinc-900">3</span>\n  ${peekon('bell')}\n</button>`,
  },
  {
    id: 'card',
    name: 'Card',
    note: 'Any box can be a host, not only buttons.',
    family: 'beyond',
    icon: 'folder',
    html: `<a href="#styles" class="block w-60 rounded-xl border border-zinc-200 bg-white p-4 text-left hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600" data-peekon="folder"><span class="block text-sm font-semibold">Q3 roadmap</span><span class="mt-1 block text-xs text-zinc-500">12 files, edited 2 hours ago</span></a>`,
    code: `<a href="/roadmap" className="block w-60 rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">\n  <span className="block text-sm font-semibold">Q3 roadmap</span>\n  <span className="mt-1 block text-xs text-zinc-500">12 files, edited 2 hours ago</span>\n  ${peekon('folder')}\n</a>`,
  },
  {
    id: 'word',
    name: 'A word in a sentence',
    note: 'Inline links work too.',
    family: 'beyond',
    icon: 'github',
    gesture: 'hop',
    html: `<p class="max-w-56 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Found a bug? Open an issue on <a href="#styles" class="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50" data-peekon="github" data-peekon-gesture="hop">GitHub</a>.</p>`,
    code: `<p>\n  Found a bug? Open an issue on{' '}\n  <a href="https://github.com/you/repo" className="font-medium underline underline-offset-4">\n    GitHub\n    ${peekon('github', 'hop')}\n  </a>\n</p>`,
  },
  {
    id: 'chip',
    name: 'Chip',
    note: 'Small labels and filters.',
    family: 'beyond',
    icon: 'check',
    gesture: 'flip',
    html: `<button class="inline-flex h-7 items-center rounded-full border border-emerald-300 bg-emerald-50 px-3 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200" data-peekon="check" data-peekon-gesture="flip">Verified</button>`,
    code: `<button className="inline-flex h-7 items-center rounded-full border border-emerald-300 bg-emerald-50 px-3 text-xs font-medium text-emerald-800">\n  Verified\n  ${peekon('check', 'flip')}\n</button>`,
  },
  {
    id: 'newsletter',
    name: 'Field and button',
    note: 'The mascot rides on the button, not the input.',
    family: 'beyond',
    icon: 'mail',
    html: `<form class="flex gap-2" onsubmit="return false"><input type="email" placeholder="you@example.com" aria-label="Email" class="h-9 w-44 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" /><button class="${BUTTONS.solid}" data-peekon="mail">Subscribe</button></form>`,
    code: `<form className="flex gap-2">\n  <input type="email" placeholder="you@example.com" className="h-9 w-44 rounded-md border border-zinc-300 px-3 text-sm" />\n  <button className="${BUTTONS.solid}">\n    Subscribe\n    ${peekon('mail')}\n  </button>\n</form>`,
  },
  {
    id: 'search',
    name: 'Search field',
    note: 'The wrapper is the host, so focus inside it counts.',
    family: 'beyond',
    icon: 'search',
    html: `<label class="flex h-9 w-60 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm focus-within:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950" data-peekon="search"><input placeholder="Search docs" class="min-w-0 flex-1 bg-transparent outline-none" /><kbd class="rounded border border-zinc-300 px-1 text-[11px] text-zinc-500 dark:border-zinc-700">/</kbd></label>`,
    code: `<label className="flex h-9 w-60 items-center gap-2 rounded-md border border-zinc-300 px-3 text-sm focus-within:border-zinc-500">\n  <input placeholder="Search docs" className="min-w-0 flex-1 bg-transparent outline-none" />\n  <kbd className="rounded border border-zinc-300 px-1 text-[11px] text-zinc-500">/</kbd>\n  ${peekon('search')}\n</label>`,
  },
  {
    id: 'nav',
    name: 'Navigation',
    note: 'Menu items and tabs.',
    family: 'beyond',
    icon: 'home',
    html: `<nav class="flex gap-1 rounded-lg bg-zinc-100 p-1 text-sm dark:bg-zinc-900"><a href="#styles" class="rounded-md bg-white px-3 py-1.5 font-medium shadow-sm dark:bg-zinc-800" data-peekon="home">Home</a><a href="#styles" class="rounded-md px-3 py-1.5 text-zinc-500" data-peekon="user">Profile</a><a href="#styles" class="rounded-md px-3 py-1.5 text-zinc-500" data-peekon="chat">Messages</a></nav>`,
    code: `<nav className="flex gap-1 rounded-lg bg-zinc-100 p-1 text-sm">\n  <a href="/" className="rounded-md bg-white px-3 py-1.5 font-medium shadow-sm">\n    Home\n    ${peekon('home')}\n  </a>\n  <a href="/me" className="rounded-md px-3 py-1.5 text-zinc-500">\n    Profile\n    ${peekon('user')}\n  </a>\n  <a href="/inbox" className="rounded-md px-3 py-1.5 text-zinc-500">\n    Messages\n    ${peekon('chat')}\n  </a>\n</nav>`,
  },
  {
    id: 'player',
    name: 'Media card',
    note: 'A small player with its own mascot.',
    family: 'beyond',
    icon: 'music',
    html: `<div class="flex w-60 items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950" data-peekon="music" tabindex="0"><span class="size-10 rounded-md bg-[linear-gradient(135deg,#fb7185,#f59e0b)]"></span><span class="min-w-0 text-left"><span class="block truncate text-sm font-semibold">Morning walk</span><span class="block text-xs text-zinc-500">Lo-fi, 3:12</span></span></div>`,
    code: `<div className="flex w-60 items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3">\n  <span className="size-10 rounded-md bg-gradient-to-br from-rose-400 to-amber-500" />\n  <span>\n    <span className="block text-sm font-semibold">Morning walk</span>\n    <span className="block text-xs text-zinc-500">Lo-fi, 3:12</span>\n  </span>\n  ${peekon('music')}\n</div>`,
  },
  {
    id: 'switch',
    name: 'Switch',
    note: 'Settings rows: the whole row is the host.',
    family: 'beyond',
    icon: 'lock',
    gesture: 'nod',
    html: `<label class="flex w-60 cursor-pointer items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800" data-peekon="lock" data-peekon-gesture="nod"><span>Private account</span><input type="checkbox" class="peer sr-only" checked /><span class="relative h-5 w-9 rounded-full bg-zinc-300 transition peer-checked:bg-zinc-900 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4 dark:peer-checked:bg-zinc-50 dark:peer-checked:after:bg-zinc-900"></span></label>`,
    code: `<label className="flex w-60 items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-sm">\n  <span>Private account</span>\n  <input type="checkbox" className="peer sr-only" defaultChecked />\n  <span className="relative h-5 w-9 rounded-full bg-zinc-300 peer-checked:bg-zinc-900 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white peer-checked:after:translate-x-4" />\n  ${peekon('lock', 'nod')}\n</label>`,
  },
  {
    id: 'call',
    name: 'Contact row',
    note: 'Two mascots side by side, each on its own host.',
    family: 'beyond',
    icon: 'phone',
    html: `<div class="flex gap-2"><a href="#styles" class="${BUTTONS.outline}" data-peekon="phone">Call us</a><a href="#styles" class="${BUTTONS.outline}" data-peekon="linkedin">LinkedIn</a></div>`,
    code: `<div className="flex gap-2">\n  <a href="tel:+100000000" className="${BUTTONS.outline}">\n    Call us\n    ${peekon('phone')}\n  </a>\n  <a href="https://linkedin.com/in/you" className="${BUTTONS.outline}">\n    LinkedIn\n    ${peekon('linkedin')}\n  </a>\n</div>`,
  },
];
