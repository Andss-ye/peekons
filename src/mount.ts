import { attach, type Gesture, type PeekIcon, type PeekSound } from './peek.js';

export interface MountOptions {
  /** Dónde buscar hosts; si `root` es un host, también cuenta. Por defecto `document`. */
  root?: ParentNode;
  /** `false` apaga el saludo de todos; `data-peekon-greet="false"` lo apaga en un host. */
  greet?: boolean;
  /** Sonido para todos los hosts, por ejemplo `chirp` de `peekons/sound`. */
  sound?: PeekSound;
}

/**
 * Engancha cada `[data-peekon="<nombre>"]` con su ícono de `icons`; un `data-peekon-gesture` cambia
 * el gesto. Los hosts que ya tienen mascota se saltan.
 */
export function mount(icons: Readonly<Record<string, PeekIcon>>, { root = document, greet = true, sound }: MountOptions = {}): () => void {
  const offs: Array<() => void> = [];
  const hosts = [...root.querySelectorAll<HTMLElement>('[data-peekon]')];
  if (root instanceof HTMLElement && root.matches('[data-peekon]')) hosts.unshift(root);
  hosts.forEach((host) => {
    if (host.querySelector(':scope > .pk')) return;
    const name = host.dataset.peekon!;
    const icon = Object.hasOwn(icons, name) ? icons[name] : undefined;
    if (!icon) return console.warn(`peekons: no icon named "${name}"`);
    const gesture = host.dataset.peekonGesture as Gesture | undefined;
    offs.push(attach(host, icon, { gesture, sound, greet: greet && host.dataset.peekonGreet !== 'false' }));
  });
  return () => offs.forEach((off) => off());
}
