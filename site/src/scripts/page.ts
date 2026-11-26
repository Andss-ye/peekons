/** Engancha todas las mascotas marcadas en la página y los botones de copiar. */
import { mount } from 'peekons';
import * as icons from 'peekons/icons';
import { chirp } from '../lib/sound';

for (const id of ['install', 'api']) mount(icons, { root: document.getElementById(id)!, sound: chirp });

const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

document.addEventListener('click', async (e) => {
  const button = (e.target as Element).closest<HTMLElement>('[data-copy]');
  if (!button) return;
  const label = button.querySelector<HTMLElement>('[data-copy-label]') ?? (button.matches('[data-copy-label]') ? button : null);
  if (label) label.dataset.orig ??= label.textContent ?? '';
  let said = 'Copied';
  try {
    await navigator.clipboard.writeText(button.dataset.copy!);
  } catch {
    said = "Couldn't copy";
  }
  if (!label) return;
  label.textContent = said;
  clearTimeout(timers.get(label));
  timers.set(label, setTimeout(() => (label.textContent = label.dataset.orig!), 1500));
});
