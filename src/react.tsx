import { useEffect, useRef } from 'react';
import { bind, type Gesture, type PeekIcon, type PeekSound } from './peek.js';

/**
 * La mascota de `icon`, asomándose desde su elemento padre:
 * `<button>Escríbeme<Peekon icon={mail} /></button>`.
 */
export function Peekon({ icon, gesture, greet = true, sound }: { icon: PeekIcon; gesture?: Gesture; greet?: boolean; sound?: PeekSound }) {
  const ref = useRef<HTMLSpanElement>(null);
  // el sonido más reciente, sin re-enganchar cuando llega una función nueva en cada render
  const latest = useRef(sound);
  latest.current = sound;
  useEffect(() => {
    const pk = ref.current;
    const host = pk?.parentElement;
    if (!pk || !host) return;
    return bind(host, pk, icon, { gesture, greet, sound: (i, moment) => latest.current?.(i, moment) });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- un objeto nuevo con el mismo dibujo no re-engancha
  }, [icon.svg, icon.gesture, icon.voice, gesture, greet]);
  return <span ref={ref} className="pk" aria-hidden="true" />;
}
