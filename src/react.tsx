import { useEffect, useRef } from 'react';
import { bind, type Gesture, type PeekIcon } from './peek.js';

/**
 * La mascota de `icon`, asomándose desde su elemento padre:
 * `<button>Escríbeme<Peekon icon={mail} /></button>`.
 */
export function Peekon({ icon, gesture, greet = true }: { icon: PeekIcon; gesture?: Gesture; greet?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const pk = ref.current;
    const host = pk?.parentElement;
    if (!pk || !host) return;
    return bind(host, pk, icon, { gesture, greet });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- un objeto nuevo con el mismo dibujo no re-engancha
  }, [icon.svg, icon.gesture, gesture, greet]);
  return <span ref={ref} className="pk" aria-hidden="true" />;
}
