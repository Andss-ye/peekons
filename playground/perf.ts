import '../peekons.css';
import { mount } from '../src/index.js';
import * as icons from '../src/icons/index.js';

/** 100 botones con mascota; anota en `window.long` la duración de cada tarea larga desde el montaje. */
const all = Object.values(icons);
const long: number[] = [];
new PerformanceObserver((list) => list.getEntries().forEach((e) => long.push(e.duration))).observe({ type: 'longtask' });
for (let i = 0; i < 100; i++) {
  const b = document.body.appendChild(document.createElement('button'));
  const icon = all[i % all.length]!;
  b.dataset.peekon = icon.name;
  b.textContent = icon.name;
}
mount(icons, { greet: new URLSearchParams(location.search).get('greet') !== 'false' });
Object.assign(window, { long, mounted: true });
