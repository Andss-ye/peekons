import '../peekons.css';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { attach } from '../src/index.js';
import { mail } from '../src/icons/index.js';
import { Peekon } from '../src/react.js';

/** Monta, asoma y desmonta `n` veces con React y con attach, para medir que no quede nada vivo. */
async function cycle(n: number) {
  for (let i = 0; i < n; i++) {
    const box = document.body.appendChild(document.createElement('div'));
    const root = createRoot(box);
    flushSync(() =>
      root.render(
        <button>
          b<Peekon icon={mail} />
        </button>
      )
    );
    box.querySelector('button')!.dispatchEvent(new PointerEvent('pointerenter'));
    root.unmount();
    box.remove();

    const host = document.body.appendChild(document.createElement('button'));
    const off = attach(host, mail);
    host.dispatchEvent(new PointerEvent('pointerenter'));
    host.dispatchEvent(new PointerEvent('pointerleave'));
    off();
    host.remove();
  }
  await new Promise((r) => setTimeout(r, 50));
  return document.getAnimations().length;
}

Object.assign(window, { cycle });
